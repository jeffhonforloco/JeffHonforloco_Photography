/**
 * POST /api/leads — Server-side lead capture.
 * 
 * The browser POSTs here (same domain, no CORS/blocker issues).
 * This function INSERTs to Supabase server-side.
 */
export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    
    const name = (body.name || '').trim();
    if (!name) {
      return Response.json({ ok: false, error: 'Name is required' }, { status: 400 });
    }
    
    const supabaseUrl = (env.VITE_SUPABASE_URL || env.SUPABASE_URL || '').trim().replace(/\/+$/, '');
    const supabaseKey = (env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || '').trim();
    
    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ ok: false, error: 'Server Supabase not configured' }, { status: 500 });
    }
    
    const row = {
      name,
      phone: (body.phone || '').trim() || null,
      email: (body.email || '').trim() || null,
      service_interest: (body.service_interest || 'General inquiry').trim(),
      source: (body.source || 'jade_chat').trim(),
      conversation: (body.conversation || '').trim() || null,
    };
    
    const res = await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(row),
    });
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return Response.json({ ok: false, error: `Supabase ${res.status}: ${text.slice(0, 200)}` }, { status: 502 });
    }
    
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
