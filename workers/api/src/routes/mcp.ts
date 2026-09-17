import { Hono } from 'hono';
import type { AppEnv } from './types';

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
    description: 'Get photography service pricing',
    inputSchema: {
      type: 'object',
      properties: {
        service: { type: 'string', description: 'Service type: headshots, fashion, wedding, portrait, event' },
      },
    },
  },
  {
    name: 'check_availability',
    description: 'Check photographer availability for a date',
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

const PRICING: Record<string, { starting: number; description: string }> = {
  headshots: { starting: 299, description: 'Professional headshots, 1-hour session, 10 retouched images' },
  fashion: { starting: 499, description: 'Fashion/editorial shoot, half-day, 20 retouched images' },
  portrait: { starting: 349, description: 'Portrait session, 1.5 hours, 15 retouched images' },
  wedding: { starting: 1499, description: 'Wedding coverage, 6 hours, 200+ edited images' },
  event: { starting: 599, description: 'Corporate event coverage, 3 hours, 100+ edited images' },
};

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
          result = service === 'all' ? PRICING : PRICING[service] || { error: 'Service not found' };
          break;
        }
        
        case 'get_services': {
          result = Object.keys(PRICING).map((key) => ({
            name: key,
            starting_price: PRICING[key].starting,
            description: PRICING[key].description,
          }));
          break;
        }
        
        case 'check_availability': {
          // In production, check against bookings table
          result = {
            date: args.date,
            available: true,
            note: 'Contact for confirmation. Weekends book 2-3 weeks out.',
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
          const { name, email, phone, service, message } = args;
          if (!name || !email || !message) {
            throw new Error('name, email, and message are required');
          }
          const lead = await c.env.DB.prepare(
            `INSERT INTO contacts (full_name, email, phone, service_type, message, source, created_at) VALUES (?, ?, ?, ?, ?, 'mcp', ?)`
          ).bind(name, email, phone || null, service || null, message, new Date().toISOString()).run();
          result = { success: true, lead_id: lead.meta.last_row_id, message: 'Lead submitted successfully' };
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

// WebMCP discovery endpoint - advertises MCP capability to browsers
mcp.get('/.well-known/mcp', (c) => {
  return c.json({
    name: 'jeffhonforloco-photography',
    version: '1.0.0',
    endpoint: '/api/v1/mcp',
    capabilities: ['tools'],
    tools: TOOLS.map((t) => t.name),
  });
});

export default mcp;
