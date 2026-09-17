/**
 * Shared PayPal helpers (Orders v2 / Payments v2). PayPal is the sole
 * payment provider for the shop and for service payments.
 */

export function paypalBase(mode: string): string {
  return mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

export function paypalMode(env: Record<string, string | undefined>): string {
  return (env.PAYPAL_MODE || '').toLowerCase() === 'live' ? 'live' : 'sandbox';
}

export function paypalMoney(centsValue: number): string {
  return (centsValue / 100).toFixed(2);
}

export interface PayPalEnv {
  clientId: string;
  clientSecret: string;
  mode: string;
  base: string;
}

export function getPayPalEnv(c: any): PayPalEnv | null {
  const clientId = (c.env.PAYPAL_CLIENT_ID || '').trim();
  const clientSecret = (c.env.PAYPAL_CLIENT_SECRET || '').trim();
  if (!clientId || !clientSecret) return null;
  const mode = paypalMode(c.env);
  return { clientId, clientSecret, mode, base: paypalBase(mode) };
}

export async function getPayPalAccessToken(pp: PayPalEnv): Promise<string> {
  const creds = btoa(`${pp.clientId}:${pp.clientSecret}`);
  const res = await fetch(`${pp.base}/v1/oauth2/token`, {
    method: 'POST',
    headers: { Authorization: `Basic ${creds}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`PayPal auth failed (${res.status}): ${txt.slice(0, 200)}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error('PayPal auth returned no access token');
  return data.access_token;
}

export function paypalNotConfigured(c: any) {
  return c.json(
    { success: false, needsPayPal: true, error: 'PayPal is not configured yet — connect a PayPal account in the admin settings.' },
    501
  );
}
