import type { Context, Next } from 'hono';
import type { AppEnv } from './types';

/**
 * SOC 2 aligned security headers middleware.
 * Protects against XSS, clickjacking, MIME sniffing, and protocol downgrade attacks.
 */
export async function securityHeaders(c: Context<AppEnv>, next: Next) {
  await next();
  
  // Prevent clickjacking - only allow framing from same origin
  c.header('X-Frame-Options', 'SAMEORIGIN');
  
  // Prevent MIME type sniffing
  c.header('X-Content-Type-Options', 'nosniff');
  
  // Control referrer information
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Enforce HTTPS (2 years, include subdomains)
  c.header('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  
  // Restrict browser features
  c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=()');
  
  // XSS protection (legacy but still useful)
  c.header('X-XSS-Protection', '1; mode=block');
  
  // Content Security Policy - restrict resource loading
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://api-jeffhonforloco-photography.ancient-sun-d712.workers.dev https://*.supabase.co",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');
  c.header('Content-Security-Policy', csp);
}

/**
 * Rate limiting middleware using Cloudflare Worker's built-in capabilities.
 * Tracks requests by IP + endpoint to prevent abuse.
 */
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(maxRequests: number, windowMs: number) {
  return async (c: Context<AppEnv>, next: Next) => {
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || 'unknown';
    const path = new URL(c.req.url).pathname;
    const key = `${ip}:${path}`;
    const now = Date.now();
    
    const record = rateLimitStore.get(key);
    if (record && now < record.resetAt) {
      if (record.count >= maxRequests) {
        return c.json({ error: 'Too many requests. Please try again later.' }, 429);
      }
      record.count++;
    } else {
      rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    }
    
    // Cleanup old entries periodically
    if (rateLimitStore.size > 10000) {
      for (const [k, v] of rateLimitStore.entries()) {
        if (now > v.resetAt) rateLimitStore.delete(k);
      }
    }
    
    await next();
  };
}

/**
 * Audit logging for admin actions (SOC 2 requirement).
 * Logs who did what, when, from where.
 */
export async function auditLog(
  env: AppEnv['Bindings'],
  action: string,
  actor: string,
  details: Record<string, unknown> = {},
  ip?: string
) {
  try {
    await env.DB.prepare(
      `INSERT INTO audit_logs (action, actor, details, ip_address, created_at) VALUES (?, ?, ?, ?, ?)`
    ).bind(
      action,
      actor,
      JSON.stringify(details),
      ip || 'unknown',
      new Date().toISOString()
    ).run();
  } catch (e) {
    // Table may not exist yet - log to console
    console.error('[audit] Failed to write audit log:', e);
  }
}

/**
 * Input sanitization helper - strips dangerous HTML/JS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .slice(0, 10000); // Max length
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
