import { Hono } from 'hono';
import type { AppEnv } from './types';
import { SERVICE_PRICING, findServicePricing } from '../lib/pricing';
import { scheduleLeadFollowups } from '../lib/leadAutomation';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const mcp = new Hono<AppEnv>();

/**
 * MCP (Model Context Protocol) endpoint for AI agent integration.
 * Allows AI assistants to query site data, check availability, and get pricing.
 * Follows JSON-RPC 2.0 specification.
 */

// Available tools for AI agents
const TOOLS = [
  {
    name: 'get_pricing',
    description: 'Get real photography service pricing from the studio price list',
    inputSchema: {
      type: 'object',
      properties: {
        service: { type: 'string', description: 'Service type: headshots, fashion, wedding, portrait, event' },
      },
    },
  },
  {
    name: 'check_availability',
    description: 'Check photographer availability for a date (based on confirmed bookings)',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Date in YYYY-MM-DD format' },
      },
      required: ['date'],
    },
  },
  {
    name: 'get_services',
    description: 'List all photography services offered',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_portfolio',
    description: 'Get portfolio images by category',
    inputSchema: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Category: fashion, beauty, wedding, portrait, editorial' },
        limit: { type: 'number', description: 'Max results (default 10)' },
      },
    },
  },
  {
    name: 'submit_lead',
    description: 'Submit a lead/inquiry from a conversation',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Full name' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number (optional)' },
        service: { type: 'string', description: 'Service interested in' },
        message: { type: 'string', description: 'Inquiry details' },
      },
      required: ['name', 'email', 'message'],
    },
  },
];


// MCP handshake - list available tools
mcp.post('/', async (c) => {
  const body = await c.req.json<{ jsonrpc: string; method: string; params?: any; id: string | number }>();
  
  if (body.jsonrpc !== '2.0') {
    return c.json({ jsonrpc: '2.0', error: { code: -32600, message: 'Invalid Request' }, id: body.id });
  }

  // Initialize
  if (body.method === 'initialize') {
    return c.json({
      jsonrpc: '2.0',
      result: {
        protocolVersion: '2024-11-05',
        capabilities: { tools: {} },
        serverInfo: { name: 'jeffhonforloco-photography', version: '1.0.0' },
      },
      id: body.id,
    });
  }

  // List tools
  if (body.method === 'tools/list') {
    return c.json({ jsonrpc: '2.0', result: { tools: TOOLS }, id: body.id });
  }

  // Call tool
  if (body.method === 'tools/call') {
    const { name, arguments: args } = body.params;
    
    try {
      let result: any;
      
      switch (name) {
        case 'get_pricing': {
          const service = args?.service?.toLowerCase() || 'all';
          if (service === 'all') {
            result = SERVICE_PRICING.map((sp) => ({ id: sp.id, name: sp.name, starting_price: sp.starting, tiers: sp.tiers }));
          } else {
            const found = findServicePricing(service);
            result = found || { error: `Service not found: ${service}. Available: ${SERVICE_PRICING.map((sp) => sp.id).join(', ')}` };
          }
          break;
        }

        case 'get_services': {
          result = SERVICE_PRICING.map((sp) => ({
            id: sp.id,
            name: sp.name,
            tagline: sp.tagline,
            starting_price: sp.starting,
            tiers: sp.tiers,
          }));
          break;
        }
        
        case 'check_availability': {
          const date = args?.date;
          if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            throw new Error('date is required in YYYY-MM-DD format');
          }
          const booked = await c.env.DB.prepare(
            `SELECT COUNT(*) value FROM contacts
             WHERE event_date = ? AND status IN ('booked', 'deposit_paid', 'completed')`
          ).bind(date).first<{ value: number }>();
          const count = booked?.value ?? 0;
          result = {
            date,
            available: count === 0,
            note: count === 0
              ? 'No confirmed booking on this date. Contact the studio to confirm.'
              : 'Already booked on this date. Ask about nearby dates.',
          };
          break;
        }
        
        case 'get_portfolio': {
          const category = args?.category || 'all';
          const limit = Math.min(args?.limit || 10, 50);
          const rows = await c.env.DB.prepare(
            `SELECT id, title, image_url, category FROM portfolio_images ${category !== 'all' ? 'WHERE category = ?' : ''} ORDER BY created_at DESC LIMIT ?`
          ).bind(...(category !== 'all' ? [category, limit] : [limit])).all();
          result = rows.results || [];
          break;
        }
        
        case 'submit_lead': {
          const { name, email, phone, service, message } = args || {};
          if (!name || !email || !message) {
            throw new Error('name, email, and message are required');
          }
          if (!EMAIL_RE.test(email)) {
            throw new Error('Invalid email address');
          }
          const existing = await c.env.DB.prepare(
            'SELECT id FROM contacts WHERE email = ?'
          ).bind(email).first<{ id: number }>();
          const attribution = JSON.stringify({ source: 'mcp' });
          let leadId: number;
          if (existing) {
            leadId = existing.id;
            await c.env.DB.prepare(
              `UPDATE contacts SET full_name = ?, phone = COALESCE(?, phone), message = ?,
               service_type = COALESCE(?, service_type), attribution = ?, status = 'new', updated_at = datetime('now') WHERE id = ?`
            ).bind(name, phone || null, message, service || null, attribution, leadId).run();
          } else {
            const lead = await c.env.DB.prepare(
              `INSERT INTO contacts (full_name, email, phone, service_type, message, attribution, status)
               VALUES (?, ?, ?, ?, ?, ?, 'new')`
            ).bind(name, email, phone || null, service || null, message, attribution).run();
            leadId = Number(lead.meta.last_row_id);
          }
          await c.env.DB.prepare(
            `INSERT INTO analytics (event_type, event_data) VALUES ('Lead', ?)`
          ).bind(JSON.stringify({ contactId: leadId, service: service || null, source: 'mcp' })).run();
          try {
            await scheduleLeadFollowups(c.env, leadId);
          } catch (e) {
            console.error('[mcp] Failed to schedule follow-ups:', e);
          }
          result = { success: true, lead_id: leadId, message: 'Lead submitted successfully' };
          break;
        }
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
      
      return c.json({
        jsonrpc: '2.0',
        result: { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] },
        id: body.id,
      });
    } catch (e) {
      return c.json({
        jsonrpc: '2.0',
        error: { code: -32603, message: e instanceof Error ? e.message : 'Internal error' },
        id: body.id,
      });
    }
  }

  return c.json({
    jsonrpc: '2.0',
    error: { code: -32601, message: `Method not found: ${body.method}` },
    id: body.id,
  });
});

// WebMCP discovery document - served both at /api/v1/mcp/.well-known/mcp
// and at the root /.well-known/mcp for standard discovery.
export function mcpDiscovery() {
  return {
    name: 'jeffhonforloco-photography',
    version: '1.0.0',
    endpoint: '/api/v1/mcp',
    capabilities: ['tools'],
    tools: TOOLS.map((t) => t.name),
  };
}

// WebMCP discovery endpoint - advertises MCP capability to browsers
mcp.get('/.well-known/mcp', (c) => {
  return c.json(mcpDiscovery());
});

export default mcp;
