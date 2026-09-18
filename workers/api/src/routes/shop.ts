import { Hono } from 'hono';
import { requireAuth, requireAdmin } from '../middleware/auth';
import type { AppEnv } from '../types';

export const shopPublic = new Hono<AppEnv>();
export const shopAdmin = new Hono<AppEnv>();
export const paypalWebhook = new Hono<AppEnv>();

/* ------------------------------------------------------------------ */
/* Schema (D1) — auto-created on first hit                             */
/* ------------------------------------------------------------------ */

// The admin UI fires several shop requests in parallel (products + orders +
// settings), and every request used to run the full schema DDL batch. Those
// concurrent DDL batches intermittently collided in D1 (write contention),
// throwing an uncaught exception that surfaced as a plain-text 500
// "Internal Server Error" the admin UI could not parse. Serialize the ensure
// so one in-flight run is shared, and never let a transient DDL failure 500
// a request on a live database.
let shopSchemaPromise: Promise<void> | null = null;

async function ensureShopSchemaInner(db: D1Database) {
  // Phase 1: create tables only.
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      category TEXT NOT NULL DEFAULT 'Prints',
      product_type TEXT NOT NULL DEFAULT 'physical',
      price_cents INTEGER NOT NULL DEFAULT 0,
      compare_at_cents INTEGER,
      sku TEXT,
      inventory INTEGER NOT NULL DEFAULT 0,
      weight_oz REAL NOT NULL DEFAULT 0,
      featured INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      affiliate_url TEXT,
      affiliate_retailer TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS product_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      thumbnail_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      value TEXT NOT NULL,
      price_adjust_cents INTEGER NOT NULL DEFAULT 0,
      sku TEXT,
      inventory INTEGER
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paypal_order_id TEXT UNIQUE,
      paypal_capture_id TEXT,
      provider TEXT NOT NULL DEFAULT 'paypal',
      email TEXT NOT NULL,
      customer_name TEXT,
      shipping_json TEXT,
      subtotal_cents INTEGER NOT NULL DEFAULT 0,
      shipping_cents INTEGER NOT NULL DEFAULT 0,
      tax_cents INTEGER NOT NULL DEFAULT 0,
      total_cents INTEGER NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'usd',
      status TEXT NOT NULL DEFAULT 'pending',
      fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled',
      tracking_number TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER,
      variant_id INTEGER,
      name TEXT NOT NULL,
      variant_label TEXT,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price_cents INTEGER NOT NULL DEFAULT 0,
      total_cents INTEGER NOT NULL DEFAULT 0
    )`),
    db.prepare(`CREATE TABLE IF NOT EXISTS shop_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`),
  ]);
  // Phase 2: migrate pre-existing DBs — add PayPal columns before any index references them.
  for (const sql of [
    `ALTER TABLE orders ADD COLUMN paypal_order_id TEXT`,
    `ALTER TABLE orders ADD COLUMN paypal_capture_id TEXT`,
    `ALTER TABLE orders ADD COLUMN provider TEXT`,
  ]) {
    try {
      await db.prepare(sql).run();
    } catch (e: any) {
      if (!String(e?.message || e).toLowerCase().includes('duplicate column')) throw e;
    }
  }
  // Phase 3: indexes (columns are now guaranteed to exist).
  await db.batch([
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_products_active ON products(active, category)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_pimg_product ON product_images(product_id, sort_order)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_pvar_product ON product_variants(product_id)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status, created_at)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_orders_paypal ON orders(paypal_order_id)`),
    db.prepare(`CREATE INDEX IF NOT EXISTS idx_oitem_order ON order_items(order_id)`),
  ]);
  // Backfill the provider for orders created before the column existed.
  await db.prepare(
    `UPDATE orders SET provider = 'paypal' WHERE provider IS NULL`
  ).run().catch(() => {});
  // Seed default shop settings on first run
  const existing = await db.prepare(`SELECT COUNT(*) AS n FROM shop_settings`).first<{ n: number }>();
  if (!existing || existing.n === 0) {
    await db.batch([
      db.prepare(`INSERT OR IGNORE INTO shop_settings (key, value) VALUES ('store_name', 'Jeff Honforloco — Shop')`),
      db.prepare(`INSERT OR IGNORE INTO shop_settings (key, value) VALUES ('flat_shipping_cents', '795')`),
      db.prepare(`INSERT OR IGNORE INTO shop_settings (key, value) VALUES ('free_shipping_over_cents', '15000')`),
      db.prepare(`INSERT OR IGNORE INTO shop_settings (key, value) VALUES ('tax_rate_percent', '0')`),
      db.prepare(`INSERT OR IGNORE INTO shop_settings (key, value) VALUES ('currency', 'usd')`),
      db.prepare(`INSERT OR IGNORE INTO shop_settings (key, value) VALUES ('store_email', 'info@jeffhonforlocophotos.com')`),
      db.prepare(`INSERT OR IGNORE INTO shop_settings (key, value) VALUES ('shop_enabled', '0')`),
    ]);
  }
}

export async function ensureShopSchema(db: D1Database): Promise<void> {
  if (!shopSchemaPromise) {
    shopSchemaPromise = ensureShopSchemaInner(db).catch((e) => {
      // Non-fatal: on a live DB the tables already exist, so a transient DDL
      // collision must not fail the request. Reset the guard so the next
      // request retries the ensure.
      console.error('[shop] ensureShopSchema failed (non-fatal):', e);
      shopSchemaPromise = null;
    });
  }
  await shopSchemaPromise;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const PUBLIC_CATEGORIES = ['Apparel', 'Prints', 'Books', 'Frames', 'Affiliate', 'Accessories'];

function slugify(name: string): string {
  const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'product';
  return `${base}-${Math.random().toString(36).slice(2, 8)}`;
}

function cents(n: unknown, fallback = 0): number {
  const v = typeof n === 'number' ? n : parseInt(String(n ?? ''), 10);
  return Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback;
}

async function getSettings(db: D1Database): Promise<Record<string, string>> {
  const rows = await db.prepare(`SELECT key, value FROM shop_settings`).all<{ key: string; value: string }>();
  const out: Record<string, string> = {};
  for (const r of (rows.results ?? [])) out[r.key] = r.value;
  return out;
}

interface ProductRow {
  id: number; name: string; slug: string; description: string | null;
  category: string; product_type: string; price_cents: number;
  compare_at_cents: number | null; sku: string | null; inventory: number;
  weight_oz: number; featured: number; active: number;
  affiliate_url: string | null; affiliate_retailer: string | null;
  created_at: string; updated_at: string;
}

async function hydrateProduct(db: D1Database, row: ProductRow) {
  const images = await db.prepare(
    `SELECT id, image_url, thumbnail_url, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC`
  ).bind(row.id).all();
  const variants = await db.prepare(
    `SELECT id, name, value, price_adjust_cents, sku, inventory FROM product_variants WHERE product_id = ? ORDER BY id ASC`
  ).bind(row.id).all();
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    category: row.category,
    product_type: row.product_type,
    price_cents: row.price_cents,
    compare_at_cents: row.compare_at_cents,
    sku: row.sku,
    inventory: row.inventory,
    weight_oz: row.weight_oz,
    featured: row.featured === 1,
    active: row.active === 1,
    affiliate_url: row.affiliate_url,
    affiliate_retailer: row.affiliate_retailer,
    images: (images.results ?? []).map((i: any) => ({
      id: i.id, image_url: i.image_url, thumbnail_url: i.thumbnail_url ?? i.image_url, sort_order: i.sort_order,
    })),
    variants: (variants.results ?? []).map((v: any) => ({
      id: v.id, name: v.name, value: v.value,
      price_adjust_cents: v.price_adjust_cents, sku: v.sku, inventory: v.inventory,
    })),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function publicProduct(p: Awaited<ReturnType<typeof hydrateProduct>>) {
  // Strip nothing sensitive — products are public by design; keep shape stable.
  return p;
}

/** The shop is OFF (hidden) by default. Jeff flips it ON in Admin → Shop → Settings. */
async function shopEnabled(db: D1Database): Promise<boolean> {
  const s = await getSettings(db);
  return s.shop_enabled === '1';
}

function shopDisabledResponse(c: any) {
  return c.json({ error: 'Shop is not available' }, 404);
}

/* ------------------------------------------------------------------ */
/* PUBLIC — GET /api/v1/shop/products                                   */
/* ------------------------------------------------------------------ */

shopPublic.get('/products', async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  if (!(await shopEnabled(db))) return shopDisabledResponse(c);
  const category = c.req.query('category');
  const featured = c.req.query('featured');
  const q = (c.req.query('q') || '').trim();
  const limit = Math.min(parseInt(c.req.query('limit') || '48', 10) || 48, 100);
  const offset = Math.max(parseInt(c.req.query('offset') || '0', 10) || 0, 0);

  let sql = `SELECT * FROM products WHERE active = 1`;
  const params: unknown[] = [];
  if (category && PUBLIC_CATEGORIES.includes(category)) { sql += ` AND category = ?`; params.push(category); }
  if (featured === '1' || featured === 'true') { sql += ` AND featured = 1`; }
  if (q) { sql += ` AND (name LIKE ? OR description LIKE ?)`; params.push(`%${q}%`, `%${q}%`); }
  sql += ` ORDER BY featured DESC, created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const rows = await db.prepare(sql).bind(...params).all<ProductRow>();
  const products = [];
  for (const row of (rows.results ?? [])) products.push(publicProduct(await hydrateProduct(db, row)));

  const countRow = await db.prepare(
    `SELECT COUNT(*) AS n FROM products WHERE active = 1${category && PUBLIC_CATEGORIES.includes(category) ? ' AND category = ?' : ''}`
  ).bind(...(category && PUBLIC_CATEGORIES.includes(category) ? [category] : [])).first<{ n: number }>();

  return c.json({ success: true, data: { products, total: countRow?.n ?? products.length } });
});

shopPublic.get('/products/:slug', async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  if (!(await shopEnabled(db))) return shopDisabledResponse(c);
  const row = await db.prepare(`SELECT * FROM products WHERE slug = ? AND active = 1`).bind(c.req.param('slug')).first<ProductRow>();
  if (!row) return c.json({ error: 'Product not found' }, 404);
  return c.json({ success: true, data: { product: publicProduct(await hydrateProduct(db, row)) } });
});

shopPublic.get('/settings/public', async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  const s = await getSettings(db);
  return c.json({
    success: true,
    data: {
      shop_enabled: s.shop_enabled === '1',
      store_name: s.store_name ?? 'Jeff Honforloco — Shop',
      flat_shipping_cents: cents(s.flat_shipping_cents, 795),
      free_shipping_over_cents: cents(s.free_shipping_over_cents, 15000),
      tax_rate_percent: parseFloat(s.tax_rate_percent ?? '0') || 0,
      currency: (s.currency ?? 'usd').toLowerCase(),
      store_email: s.store_email ?? 'info@jeffhonforlocophotos.com',
    },
  });
});

/* ------------------------------------------------------------------ */
/* PayPal helpers — shared with service payments (lib/paypal)          */
/* ------------------------------------------------------------------ */

import {
  getPayPalEnv,
  getPayPalAccessToken,
  paypalMoney,
} from '../lib/paypal';
import { handleServicePaymentEvent } from './services';

/**
 * Pull the buyer name and shipping address out of a PayPal order or capture
 * payload. Returns nulls when PayPal didn't include them (e.g. digital goods).
 */
function paypalBuyerInfo(payload: any): { name: string | null; shippingJson: string | null } {
  const pu = payload?.purchase_units?.[0];
  const payer = payload?.payer;
  const payerName = [payer?.name?.given_name, payer?.name?.surname].filter(Boolean).join(' ') || null;
  const shipName = pu?.shipping?.name?.full_name || null;
  const addr = pu?.shipping?.address;
  const shippingJson = addr ? JSON.stringify({ name: shipName, ...addr }).slice(0, 2000) : null;
  return { name: payerName || shipName, shippingJson };
}

/**
 * Mark a pending order paid and decrement inventory. Idempotent: only
 * transitions from 'pending', so capture endpoints and webhooks from
 * either provider can all call it safely (inventory decrements once).
 */
async function markOrderPaid(
  db: D1Database,
  orderId: number,
  patch: { paypal_capture_id?: string | null } = {},
): Promise<boolean> {
  const now = new Date().toISOString();
  const order = await db.prepare(`SELECT * FROM orders WHERE id = ?`).bind(orderId).first<any>();
  if (!order || order.status !== 'pending') return false;
  await db.prepare(`UPDATE orders SET status = 'paid', paypal_capture_id = COALESCE(?, paypal_capture_id), updated_at = ? WHERE id = ?`)
    .bind(patch.paypal_capture_id ?? null, now, orderId).run();
  const items = await db.prepare(`SELECT * FROM order_items WHERE order_id = ?`).bind(orderId).all<any>();
  const decs: D1PreparedStatement[] = [];
  for (const it of (items.results ?? [])) {
    if (it.variant_id) {
      decs.push(db.prepare(`UPDATE product_variants SET inventory = MAX(0, COALESCE(inventory, 999999) - ?) WHERE id = ?`).bind(it.quantity, it.variant_id));
    } else if (it.product_id) {
      decs.push(db.prepare(`UPDATE products SET inventory = MAX(0, inventory - ?), updated_at = ? WHERE id = ?`).bind(it.quantity, now, it.product_id));
    }
  }
  if (decs.length) await db.batch(decs);
  return true;
}

/* ------------------------------------------------------------------ */
/* CHECKOUT — POST /api/v1/shop/checkout (PayPal Orders v2)             */
/* ------------------------------------------------------------------ */

interface CheckoutItem { product_id: number; variant_id?: number | null; quantity: number }

shopPublic.post('/checkout', async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  if (!(await shopEnabled(db))) return shopDisabledResponse(c);

  const pp = getPayPalEnv(c);
  if (!pp) {
    return c.json({ success: false, needsPayPal: true, error: 'PayPal is not configured yet — connect a PayPal account in the admin Shop settings.' }, 501);
  }

  const body = await c.req.json().catch(() => null) as {
    items?: CheckoutItem[]; email?: string; customer_name?: string;
    shipping?: { name?: string; line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string };
  } | null;
  const items = Array.isArray(body?.items) ? body!.items : [];
  if (items.length === 0) return c.json({ error: 'Cart is empty' }, 400);
  if (items.length > 50) return c.json({ error: 'Too many line items' }, 400);

  const email = (body?.email || '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return c.json({ error: 'A valid email is required for the receipt' }, 400);

  const settings = await getSettings(db);
  const currency = (settings.currency ?? 'usd').toLowerCase();
  const currencyCode = currency.toUpperCase();
  const origin = (c.req.header('origin') || 'https://jeffhonforlocophotos.com').replace(/\/+$/, '');

  // Validate every line server-side — never trust client prices.
  const lines: { name: string; variant_label: string | null; unit_price_cents: number; quantity: number; product_id: number; variant_id: number | null; image_url: string | null }[] = [];
  for (const it of items) {
    const qty = Math.min(Math.max(parseInt(String(it.quantity), 10) || 1, 1), 99);
    const prod = await db.prepare(`SELECT * FROM products WHERE id = ? AND active = 1`).bind(it.product_id).first<ProductRow>();
    if (!prod) return c.json({ error: `Product #${it.product_id} is not available` }, 400);
    if (prod.product_type === 'affiliate') return c.json({ error: `"${prod.name}" is an affiliate product — buy it on the retailer's site` }, 400);

    let unit = prod.price_cents;
    let variantLabel: string | null = null;
    let variantId: number | null = null;
    if (it.variant_id) {
      const v = await db.prepare(`SELECT * FROM product_variants WHERE id = ? AND product_id = ?`).bind(it.variant_id, prod.id).first<any>();
      if (!v) return c.json({ error: `Variant not found for "${prod.name}"` }, 400);
      unit += v.price_adjust_cents || 0;
      variantLabel = `${v.name}: ${v.value}`;
      variantId = v.id;
      if (v.inventory != null && v.inventory < qty) return c.json({ error: `Only ${v.inventory} left of "${prod.name} (${variantLabel})"` }, 400);
    } else if (prod.inventory < qty) {
      return c.json({ error: `Only ${prod.inventory} left of "${prod.name}"` }, 400);
    }

    const img = await db.prepare(`SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC LIMIT 1`).bind(prod.id).first<{ image_url: string }>();
    lines.push({ name: prod.name, variant_label: variantLabel, unit_price_cents: unit, quantity: qty, product_id: prod.id, variant_id: variantId, image_url: img?.image_url ?? null });
  }

  const subtotal = lines.reduce((s, l) => s + l.unit_price_cents * l.quantity, 0);
  const flatShip = cents(settings.flat_shipping_cents, 795);
  const freeOver = cents(settings.free_shipping_over_cents, 15000);
  const shipping = subtotal >= freeOver ? 0 : flatShip;
  const taxRate = parseFloat(settings.tax_rate_percent ?? '0') || 0;
  const tax = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + shipping + tax;

  let accessToken: string;
  try {
    accessToken = await getPayPalAccessToken(pp);
  } catch (e) {
    console.error('[shop] PayPal auth failed:', e instanceof Error ? e.message : e);
    return c.json({ error: 'Could not start checkout — please try again' }, 502);
  }

  // Create the PayPal order (intent CAPTURE). Breakdown must sum to the total.
  const orderBody = {
    intent: 'CAPTURE',
    purchase_units: [{
      reference_id: `jh-shop-${Date.now()}`,
      description: 'Jeff Honforloco Photography — shop order',
      amount: {
        currency_code: currencyCode,
        value: paypalMoney(total),
        breakdown: {
          item_total: { currency_code: currencyCode, value: paypalMoney(subtotal) },
          shipping: { currency_code: currencyCode, value: paypalMoney(shipping) },
          tax_total: { currency_code: currencyCode, value: paypalMoney(tax) },
        },
      },
      items: lines.map((l) => ({
        name: variantLabelOf(l).slice(0, 127),
        unit_amount: { currency_code: currencyCode, value: paypalMoney(l.unit_price_cents) },
        quantity: String(l.quantity),
      })),
    }],
    application_context: {
      brand_name: 'Jeff Honforloco Photography',
      return_url: `${origin}/shop/success`,
      cancel_url: `${origin}/shop?canceled=1`,
      user_action: 'PAY_NOW',
    },
  };

  const pres = await fetch(`${pp.base}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': crypto.randomUUID(),
    },
    body: JSON.stringify(orderBody),
  });
  if (!pres.ok) {
    const txt = await pres.text().catch(() => '');
    console.error('[shop] PayPal order create failed:', pres.status, txt.slice(0, 300));
    return c.json({ error: 'Could not start checkout — please try again' }, 502);
  }
  const pOrder = (await pres.json()) as { id: string; links?: { href: string; rel: string }[] };
  const approveUrl = pOrder.links?.find((l) => l.rel === 'approve' || l.rel === 'payer-action')?.href;
  if (!pOrder.id || !approveUrl) {
    console.error('[shop] PayPal order create returned no approval URL');
    return c.json({ error: 'Could not start checkout — please try again' }, 502);
  }

  // Persist a pending order so nothing is lost if the webhook is delayed.
  const now = new Date().toISOString();
  const ores = await db.prepare(
    `INSERT INTO orders (provider, paypal_order_id, email, customer_name, shipping_json, subtotal_cents, shipping_cents, tax_cents, total_cents, currency, status, fulfillment_status, created_at, updated_at)
     VALUES ('paypal', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'unfulfilled', ?, ?)`
  ).bind(
    pOrder.id, email, (body?.customer_name || '').slice(0, 120) || null,
    body?.shipping ? JSON.stringify(body.shipping).slice(0, 2000) : null,
    subtotal, shipping, tax, total, currency, now, now
  ).run();
  const orderId = Number(ores.meta.last_row_id);
  await db.batch(lines.map((l) =>
    db.prepare(`INSERT INTO order_items (order_id, product_id, variant_id, name, variant_label, quantity, unit_price_cents, total_cents) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(orderId, l.product_id, l.variant_id, l.name, l.variant_label, l.quantity, l.unit_price_cents, l.unit_price_cents * l.quantity)
  ));

  // fundingSource=card lands the buyer on guest card checkout (no PayPal account needed).
  const checkoutUrl = approveUrl.includes('?') ? `${approveUrl}&fundingSource=card` : `${approveUrl}?fundingSource=card`;
  return c.json({ success: true, data: { url: checkoutUrl, paypal_order_id: pOrder.id, order_id: orderId } });
});

/* ------------------------------------------------------------------ */
/* CAPTURE — POST /api/v1/shop/capture (after PayPal approval)         */
/* ------------------------------------------------------------------ */

shopPublic.post('/capture', async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  if (!(await shopEnabled(db))) return shopDisabledResponse(c);

  const pp = getPayPalEnv(c);
  if (!pp) {
    return c.json({ success: false, needsPayPal: true, error: 'PayPal is not configured yet.' }, 501);
  }

  const body = await c.req.json().catch(() => null) as { paypal_order_id?: string } | null;
  const ppOrderId = (body?.paypal_order_id || '').trim();
  if (!/^[A-Za-z0-9]{8,64}$/.test(ppOrderId)) return c.json({ error: 'Invalid PayPal order id' }, 400);

  const order = await db.prepare(`SELECT * FROM orders WHERE paypal_order_id = ?`).bind(ppOrderId).first<any>();
  if (!order) return c.json({ error: 'Order not found' }, 404);
  if (order.status === 'paid') return c.json({ success: true, data: { order_id: order.id, status: 'paid' } });
  if (order.status !== 'pending') return c.json({ error: `Order is ${order.status}` }, 409);

  let accessToken: string;
  try {
    accessToken = await getPayPalAccessToken(pp);
  } catch {
    return c.json({ error: 'Payment service unavailable — please try again' }, 502);
  }

  const cres = await fetch(`${pp.base}/v2/checkout/orders/${encodeURIComponent(ppOrderId)}/capture`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': crypto.randomUUID(),
    },
  });
  const cdata = (await cres.json().catch(() => null)) as any;
  if (!cres.ok) {
    const issue = JSON.stringify(cdata?.details ?? cdata ?? '').toUpperCase();
    console.error('[shop] PayPal capture failed:', cres.status, JSON.stringify(cdata).slice(0, 300));
    const now = new Date().toISOString();
    const nextStatus = /EXPIRED/.test(issue) ? 'expired' : 'failed';
    await db.prepare(`UPDATE orders SET status = ?, updated_at = ? WHERE id = ? AND status = 'pending'`)
      .bind(nextStatus, now, order.id).run();
    return c.json({ error: nextStatus === 'expired' ? 'This PayPal order expired — please check out again' : 'Payment was not completed' }, 502);
  }

  const capture = cdata?.purchase_units?.[0]?.payments?.captures?.[0];
  const captureId: string | null = typeof capture?.id === 'string' ? capture.id : null;
  await markOrderPaid(db, order.id, { paypal_capture_id: captureId });
  // Backfill buyer name / shipping address from PayPal (never overwrite what checkout collected).
  const info = paypalBuyerInfo(cdata);
  await db.prepare(`UPDATE orders SET customer_name = COALESCE(customer_name, ?), shipping_json = COALESCE(shipping_json, ?), updated_at = ? WHERE id = ?`)
    .bind(info.name, info.shippingJson, new Date().toISOString(), order.id).run();
  return c.json({ success: true, data: { order_id: order.id, status: 'paid', capture_id: captureId } });
});

function variantLabelOf(l: { name: string; variant_label: string | null }): string {
  return l.variant_label ? `${l.name} — ${l.variant_label}` : l.name;
}

/* ------------------------------------------------------------------ */
/* PAYPAL WEBHOOK — POST /api/v1/webhooks/paypal                       */
/* ------------------------------------------------------------------ */

paypalWebhook.post('/paypal', async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  const pp = getPayPalEnv(c);
  if (!pp) return c.json({ error: 'PayPal not configured' }, 501);
  const webhookId = (c.env.PAYPAL_WEBHOOK_ID || '').trim();
  if (!webhookId) return c.json({ error: 'PayPal webhook not configured' }, 501);

  const raw = await c.req.text();
  let event: any;
  try {
    event = JSON.parse(raw);
  } catch {
    return c.json({ error: 'Invalid JSON' }, 400);
  }

  // Verify the webhook signature with PayPal before trusting anything.
  let accessToken: string;
  try {
    accessToken = await getPayPalAccessToken(pp);
  } catch {
    return c.json({ error: 'Verification unavailable' }, 502);
  }

  const vres = await fetch(`${pp.base}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transmission_id: c.req.header('paypal-transmission-id') ?? '',
      transmission_time: c.req.header('paypal-transmission-time') ?? '',
      cert_url: c.req.header('paypal-cert-url') ?? '',
      auth_algo: c.req.header('paypal-auth-algo') ?? '',
      transmission_sig: c.req.header('paypal-transmission-sig') ?? '',
      webhook_id: webhookId,
      webhook_event: event,
    }),
  });
  const vdata = (await vres.json().catch(() => null)) as { verification_status?: string } | null;
  if (vdata?.verification_status !== 'SUCCESS') {
    console.error('[shop] PayPal webhook signature verification failed');
    return c.json({ error: 'Invalid signature' }, 400);
  }

  const type: string = event.event_type ?? '';
  const resource = event.resource ?? {};
  const relatedOrderId: string | undefined = resource?.supplementary_data?.related_ids?.order_id;
  const now = new Date().toISOString();

  if (type === 'PAYMENT.CAPTURE.COMPLETED') {
    if (relatedOrderId) {
      const order = await db.prepare(`SELECT * FROM orders WHERE paypal_order_id = ?`).bind(relatedOrderId).first<any>();
      if (order) {
        await markOrderPaid(db, order.id, { paypal_capture_id: typeof resource.id === 'string' ? resource.id : null });
        // Webhook payloads don't carry buyer/shipping details — fetch the order to recover them.
        try {
          const ores = await fetch(`${pp.base}/v2/checkout/orders/${encodeURIComponent(relatedOrderId)}`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (ores.ok) {
            const oinfo = paypalBuyerInfo(await ores.json());
            await db.prepare(`UPDATE orders SET customer_name = COALESCE(customer_name, ?), shipping_json = COALESCE(shipping_json, ?), updated_at = ? WHERE id = ?`)
              .bind(oinfo.name, oinfo.shippingJson, now, order.id).run();
          }
        } catch (e) {
          console.error('[shop] webhook order fetch failed:', e instanceof Error ? e.message : e);
        }
      } else {
        // Not a shop order — it may be a service payment (deposit / balance / full).
        await handleServicePaymentEvent(db, c.env, type, relatedOrderId, resource);
      }
    }
  } else if (type === 'PAYMENT.CAPTURE.DENIED') {
    if (relatedOrderId) {
      await db.prepare(`UPDATE orders SET status = 'failed', updated_at = ? WHERE paypal_order_id = ? AND status = 'pending'`)
        .bind(now, relatedOrderId).run();
      await handleServicePaymentEvent(db, c.env, type, relatedOrderId, resource);
    }
  } else if (type === 'PAYMENT.CAPTURE.REFUNDED') {
    if (relatedOrderId) {
      await db.prepare(`UPDATE orders SET status = 'refunded', updated_at = ? WHERE paypal_order_id = ? AND status IN ('paid','pending')`)
        .bind(now, relatedOrderId).run();
      await handleServicePaymentEvent(db, c.env, type, relatedOrderId, resource);
    }
  }

  return c.json({ received: true });
});

/* ------------------------------------------------------------------ */
/* ADMIN — /api/v1/admin/shop                                           */
/* ------------------------------------------------------------------ */

shopAdmin.get('/products', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  const q = (c.req.query('q') || '').trim();
  const category = c.req.query('category');
  const active = c.req.query('active');
  let sql = `SELECT * FROM products WHERE 1=1`;
  const params: unknown[] = [];
  if (q) { sql += ` AND (name LIKE ? OR sku LIKE ?)`; params.push(`%${q}%`, `%${q}%`); }
  if (category) { sql += ` AND category = ?`; params.push(category); }
  if (active === '1') sql += ` AND active = 1`;
  if (active === '0') sql += ` AND active = 0`;
  sql += ` ORDER BY created_at DESC`;
  const rows = await db.prepare(sql).bind(...params).all<ProductRow>();
  const out = [];
  for (const row of (rows.results ?? [])) out.push(await hydrateProduct(db, row));
  return c.json({ success: true, data: { products: out } });
});

shopAdmin.get('/products/:id', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  const row = await db.prepare(`SELECT * FROM products WHERE id = ?`).bind(c.req.param('id')).first<ProductRow>();
  if (!row) return c.json({ error: 'Product not found' }, 404);
  return c.json({ success: true, data: { product: await hydrateProduct(db, row) } });
});

interface ProductInput {
  name: string; description?: string; category?: string; product_type?: 'physical' | 'affiliate';
  price_cents?: number; compare_at_cents?: number | null; sku?: string;
  inventory?: number; weight_oz?: number; featured?: boolean; active?: boolean;
  affiliate_url?: string; affiliate_retailer?: string;
  images?: { image_url: string; thumbnail_url?: string }[];
  variants?: { name: string; value: string; price_adjust_cents?: number; sku?: string; inventory?: number | null }[];
}

async function saveProduct(db: D1Database, id: number | null, input: ProductInput) {
  const now = new Date().toISOString();
  const name = (input.name || '').trim();
  if (!name) throw new Error('Product name is required');
  const productType = input.product_type === 'affiliate' ? 'affiliate' : 'physical';
  const category = (input.category || (productType === 'affiliate' ? 'Affiliate' : 'Prints')).slice(0, 40);

  let slug: string;
  let productId: number;
  if (id) {
    const existing = await db.prepare(`SELECT slug FROM products WHERE id = ?`).bind(id).first<{ slug: string }>();
    if (!existing) throw new Error('Product not found');
    slug = existing.slug;
    await db.prepare(
      `UPDATE products SET name=?, description=?, category=?, product_type=?, price_cents=?, compare_at_cents=?, sku=?, inventory=?, weight_oz=?, featured=?, active=?, affiliate_url=?, affiliate_retailer=?, updated_at=? WHERE id=?`
    ).bind(
      name, (input.description || '').slice(0, 5000), category, productType,
      productType === 'affiliate' ? 0 : cents(input.price_cents),
      input.compare_at_cents != null && productType === 'physical' ? cents(input.compare_at_cents) : null,
      (input.sku || '').slice(0, 60) || null,
      Math.max(0, parseInt(String(input.inventory ?? 0), 10) || 0),
      Math.max(0, parseFloat(String(input.weight_oz ?? 0)) || 0),
      input.featured ? 1 : 0, input.active === false ? 0 : 1,
      productType === 'affiliate' ? (input.affiliate_url || '').slice(0, 500) || null : null,
      productType === 'affiliate' ? (input.affiliate_retailer || '').slice(0, 120) || null : null,
      now, id
    ).run();
    productId = id;
    await db.prepare(`DELETE FROM product_images WHERE product_id = ?`).bind(productId).run();
    await db.prepare(`DELETE FROM product_variants WHERE product_id = ?`).bind(productId).run();
  } else {
    slug = slugify(name);
    const res = await db.prepare(
      `INSERT INTO products (name, slug, description, category, product_type, price_cents, compare_at_cents, sku, inventory, weight_oz, featured, active, affiliate_url, affiliate_retailer, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      name, slug, (input.description || '').slice(0, 5000), category, productType,
      productType === 'affiliate' ? 0 : cents(input.price_cents),
      input.compare_at_cents != null && productType === 'physical' ? cents(input.compare_at_cents) : null,
      (input.sku || '').slice(0, 60) || null,
      Math.max(0, parseInt(String(input.inventory ?? 0), 10) || 0),
      Math.max(0, parseFloat(String(input.weight_oz ?? 0)) || 0),
      input.featured ? 1 : 0, input.active === false ? 0 : 1,
      productType === 'affiliate' ? (input.affiliate_url || '').slice(0, 500) || null : null,
      productType === 'affiliate' ? (input.affiliate_retailer || '').slice(0, 120) || null : null,
      now, now
    ).run();
    productId = Number(res.meta.last_row_id);
  }

  const images = Array.isArray(input.images) ? input.images.slice(0, 10) : [];
  if (images.length) {
    await db.batch(images.map((img, i) =>
      db.prepare(`INSERT INTO product_images (product_id, image_url, thumbnail_url, sort_order) VALUES (?, ?, ?, ?)`)
        .bind(productId, String(img.image_url).slice(0, 1000), String(img.thumbnail_url || img.image_url).slice(0, 1000), i)
    ));
  }
  const variants = Array.isArray(input.variants) ? input.variants.slice(0, 30) : [];
  const clean = variants.filter((v) => (v.name || '').trim() && (v.value || '').trim());
  if (clean.length) {
    await db.batch(clean.map((v) =>
      db.prepare(`INSERT INTO product_variants (product_id, name, value, price_adjust_cents, sku, inventory) VALUES (?, ?, ?, ?, ?, ?)`)
        .bind(productId, v.name.trim().slice(0, 60), v.value.trim().slice(0, 60), cents(v.price_adjust_cents),
          (v.sku || '').slice(0, 60) || null, v.inventory == null ? null : Math.max(0, parseInt(String(v.inventory), 10) || 0))
    ));
  }

  const row = await db.prepare(`SELECT * FROM products WHERE id = ?`).bind(productId).first<ProductRow>();
  return hydrateProduct(db, row!);
}

shopAdmin.post('/products', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  try {
    const input = await c.req.json().catch(() => null) as ProductInput | null;
    if (!input) return c.json({ error: 'Invalid JSON body' }, 400);
    const product = await saveProduct(db, null, input);
    return c.json({ success: true, data: { product } }, 201);
  } catch (e: any) {
    return c.json({ error: e?.message || 'Could not create product' }, 400);
  }
});

shopAdmin.put('/products/:id', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  try {
    const input = await c.req.json().catch(() => null) as ProductInput | null;
    if (!input) return c.json({ error: 'Invalid JSON body' }, 400);
    const product = await saveProduct(db, parseInt(c.req.param('id'), 10), input);
    return c.json({ success: true, data: { product } });
  } catch (e: any) {
    const status = e?.message === 'Product not found' ? 404 : 400;
    return c.json({ error: e?.message || 'Could not update product' }, status);
  }
});

shopAdmin.delete('/products/:id', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  const row = await db.prepare(`SELECT id FROM products WHERE id = ?`).bind(c.req.param('id')).first();
  if (!row) return c.json({ error: 'Product not found' }, 404);
  await db.prepare(`DELETE FROM products WHERE id = ?`).bind(c.req.param('id')).run();
  return c.json({ success: true });
});

shopAdmin.get('/orders', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  const status = c.req.query('status');
  const limit = Math.min(parseInt(c.req.query('limit') || '50', 10) || 50, 200);
  let sql = `SELECT * FROM orders`;
  const params: unknown[] = [];
  if (status) { sql += ` WHERE status = ?`; params.push(status); }
  sql += ` ORDER BY created_at DESC LIMIT ?`;
  params.push(limit);
  const rows = await db.prepare(sql).bind(...params).all<any>();
  const orders = [];
  for (const o of (rows.results ?? [])) {
    const items = await db.prepare(`SELECT * FROM order_items WHERE order_id = ?`).bind(o.id).all();
    orders.push({ ...o, items: items.results ?? [] });
  }
  const rev = await db.prepare(`SELECT COALESCE(SUM(total_cents),0) AS total, COUNT(*) AS n FROM orders WHERE status = 'paid'`).first<{ total: number; n: number }>();
  return c.json({ success: true, data: { orders, stats: { paid_revenue_cents: rev?.total ?? 0, paid_count: rev?.n ?? 0 } } });
});

shopAdmin.get('/orders/:id', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  const o = await db.prepare(`SELECT * FROM orders WHERE id = ?`).bind(c.req.param('id')).first<any>();
  if (!o) return c.json({ error: 'Order not found' }, 404);
  const items = await db.prepare(`SELECT * FROM order_items WHERE order_id = ?`).bind(o.id).all();
  return c.json({ success: true, data: { order: { ...o, items: items.results ?? [] } } });
});

shopAdmin.patch('/orders/:id', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  const o = await db.prepare(`SELECT * FROM orders WHERE id = ?`).bind(c.req.param('id')).first<any>();
  if (!o) return c.json({ error: 'Order not found' }, 404);
  const body = await c.req.json().catch(() => ({})) as { fulfillment_status?: string; tracking_number?: string; notes?: string; status?: string };
  const allowedFulfillment = ['unfulfilled', 'fulfilled', 'shipped', 'delivered', 'cancelled'];
  const allowedStatus = ['pending', 'paid', 'refunded', 'cancelled'];
  const updates: string[] = [];
  const params: unknown[] = [];
  if (body.fulfillment_status && allowedFulfillment.includes(body.fulfillment_status)) {
    updates.push('fulfillment_status = ?'); params.push(body.fulfillment_status);
  }
  if (body.status && allowedStatus.includes(body.status)) {
    updates.push('status = ?'); params.push(body.status);
  }
  if (body.tracking_number !== undefined) {
    updates.push('tracking_number = ?'); params.push(String(body.tracking_number).slice(0, 120) || null);
  }
  if (body.notes !== undefined) {
    updates.push('notes = ?'); params.push(String(body.notes).slice(0, 2000) || null);
  }
  if (!updates.length) return c.json({ error: 'Nothing to update' }, 400);
  updates.push(`updated_at = ?`); params.push(new Date().toISOString());
  params.push(o.id);
  await db.prepare(`UPDATE orders SET ${updates.join(', ')} WHERE id = ?`).bind(...params).run();
  const updated = await db.prepare(`SELECT * FROM orders WHERE id = ?`).bind(o.id).first();
  return c.json({ success: true, data: { order: updated } });
});

/* ------------------------------------------------------------------ */
/* ADMIN — GET /api/v1/admin/shop/revenue-by-product                   */
/* Revenue breakdown per product from paid orders.                     */
/* ------------------------------------------------------------------ */

shopAdmin.get('/revenue-by-product', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  const rows = await db.prepare(
    `SELECT oi.name AS name,
            COALESCE(SUM(oi.total_cents), 0) AS revenue_cents,
            COUNT(DISTINCT oi.order_id) AS orders
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     WHERE o.status = 'paid'
     GROUP BY oi.name
     ORDER BY revenue_cents DESC`
  ).all();
  const data = (rows.results ?? []).map((r: Record<string, unknown>) => ({
    name: String(r.name ?? ''),
    revenue_cents: Number(r.revenue_cents) || 0,
    orders: Number(r.orders) || 0,
  }));
  return c.json({ success: true, data });
});

shopAdmin.get('/settings', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  const s = await getSettings(db);
  const clientConfigured = Boolean(c.env.PAYPAL_CLIENT_ID && c.env.PAYPAL_CLIENT_SECRET);
  const webhookConfigured = Boolean(c.env.PAYPAL_WEBHOOK_ID);
  return c.json({
    success: true,
    data: {
      settings: s,
      paypal: {
        client_configured: clientConfigured,
        webhook_id_configured: webhookConfigured,
        mode: paypalMode(c.env),
        webhook_url: 'https://<worker-host>/api/v1/webhooks/paypal',
      },

    },
  });
});

shopAdmin.put('/settings', requireAuth, requireAdmin, async (c) => {
  const db = c.env.DB;
  await ensureShopSchema(db);
  const body = await c.req.json().catch(() => null) as Record<string, string> | null;
  if (!body) return c.json({ error: 'Invalid JSON body' }, 400);
  const allowed = ['store_name', 'flat_shipping_cents', 'free_shipping_over_cents', 'tax_rate_percent', 'currency', 'store_email', 'shop_enabled'];
  const pairs = Object.entries(body).filter(([k]) => allowed.includes(k));
  if (pairs.length) {
    await db.batch(pairs.map(([k, v]) =>
      db.prepare(`INSERT INTO shop_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).bind(k, String(v).slice(0, 500))
    ));
  }
  const s = await getSettings(db);
  return c.json({ success: true, data: { settings: s } });
});
