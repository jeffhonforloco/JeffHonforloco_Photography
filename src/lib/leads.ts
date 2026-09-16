/**
 * Jade lead capture — Supabase helper.
 *
 * Inserts chat leads into the Supabase `leads` table using the public anon key.
 * The table has an anon INSERT-only RLS policy, so this is safe to call from
 * the browser. Reads are blocked for anon — only the service_role key (used
 * server-side, e.g. in the Worker) can read leads.
 *
 * Never throws: on any failure it logs and returns false so the chat UX
 * is never blocked. The SalesChatbot always emails Jeff as well, so a failed
 * insert still produces an instant notification.
 */

export interface LeadInput {
  name: string;
  phone?: string;
  email?: string;
  /** snake_case (used by SalesChatbot) or camelCase — both accepted */
  service_interest?: string;
  serviceInterest?: string;
  source?: string;
  conversation?: string;
  conversationText?: string;
}

interface SupabaseConfig {
  url: string;
  anonKey: string;
}

function getSupabaseConfig(): SupabaseConfig | null {
  const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
  const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
  if (!url || !anonKey) return null;
  return { url: url.replace(/\/+$/, ''), anonKey };
}

/**
 * Insert a lead into Supabase. Returns true on success, false on any failure.
 */
export async function insertLead(input: LeadInput): Promise<boolean> {
  try {
    const config = getSupabaseConfig();
    if (!config) {
      console.warn('[leads] Supabase not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing) — skipping DB insert.');
      return false;
    }

    const name = (input.name || '').trim();
    if (!name) return false;

    const row = {
      name,
      phone: (input.phone || '').trim() || null,
      email: (input.email || '').trim() || null,
      service_interest: (input.service_interest || input.serviceInterest || 'General inquiry').trim(),
      source: (input.source || 'jade_chat').trim(),
      conversation: (input.conversation || input.conversationText || '').trim() || null,
    };

    const res = await fetch(`${config.url}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: config.anonKey,
        Authorization: `Bearer ${config.anonKey}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn('[leads] Supabase insert failed:', res.status, text.slice(0, 200));
      return false;
    }

    return true;
  } catch (err) {
    console.warn('[leads] Supabase insert error:', err);
    return false;
  }
}
