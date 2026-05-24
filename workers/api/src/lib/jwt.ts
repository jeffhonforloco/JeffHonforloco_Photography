import type { JWTPayload } from '../types';

const ALG = { name: 'HMAC', hash: 'SHA-256' } as const;

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64urlDecode(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), ALG, false, ['sign', 'verify']
  );
}

export async function signJWT(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string,
  expiresInSeconds = 86400
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const full: JWTPayload = { ...payload, iat: now, exp: now + expiresInSeconds };
  const enc = new TextEncoder();
  const header = b64url(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).buffer as ArrayBuffer);
  const body   = b64url(enc.encode(JSON.stringify(full)).buffer as ArrayBuffer);
  const input  = `${header}.${body}`;
  const key    = await importKey(secret);
  const sig    = await crypto.subtle.sign(ALG, key, enc.encode(input));
  return `${input}.${b64url(sig)}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;
    const key   = await importKey(secret);
    const valid = await crypto.subtle.verify(
      ALG, key, b64urlDecode(sig), new TextEncoder().encode(`${header}.${body}`)
    );
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(b64urlDecode(body))) as JWTPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
