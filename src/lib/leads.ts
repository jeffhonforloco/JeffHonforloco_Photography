/**
 * Jade lead capture — via server-side API.
 * 
 * POSTs to /api/leads (Cloudflare Pages Function, same domain).
 * The function INSERTs to Supabase server-side, avoiding browser
 * network blockers that prevent direct Supabase calls.
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

export async function insertLead(input: LeadInput): Promise<boolean> {
  try {
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

    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.warn('[leads] Server insert failed:', res.status, data.error || '');
      return false;
    }

    const data = await res.json().catch(() => ({}));
    return data.ok === true;
  } catch (err) {
    console.warn('[leads] Server insert error:', err);
    return false;
  }
}
