import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Mail, Send, Trash2, Search, RefreshCw, Building2, History, PenLine } from 'lucide-react';
import apiUrl from '../../lib/api-base';

interface OutreachTarget {
  id: number;
  business_name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
  category: string | null;
  location: string | null;
  unsubscribed: number;
  created_at: string;
}

interface SendRecord {
  id: number;
  subject: string;
  sent_at: string;
  status: string;
  business_name: string;
  email: string;
}

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
});

const TEMPLATES: Record<string, { label: string; subject: string; body: string }> = {
  venue: {
    label: 'Wedding venues',
    subject: 'Editorial Wedding Photography for {{business_name}}',
    body: `Dear {{business_name}} team,

My name is Jeff Honforloco, a Providence-based photographer specializing in editorial wedding and event photography across Rhode Island and New England.

I am writing because {{business_name}} is precisely the caliber of venue whose architecture and atmosphere deserve imagery that converts inquiries into booked tours. My work captures venues the way couples envision their celebration — light, detail, and atmosphere composed with editorial intention.

I would welcome the opportunity to discuss how professional venue photography could support your marketing. My wedding portfolio, published pricing, and booking availability are here:
jeffhonforlocophotos.com/providence-wedding-photographer

Thank you for your time and consideration.

Warm regards,
Jeff Honforloco
Jeff Honforloco Photography
Providence, Rhode Island
jeffhonforlocophotos.com`,
  },
  real_estate: {
    label: 'Realtors / brokerages',
    subject: 'Editorial Listing Photography for {{business_name}}',
    body: `Dear {{business_name}} team,

My name is Jeff Honforloco, a Providence-based photographer specializing in editorial real estate and architectural photography.

In a competitive market, the quality of listing photography directly influences buyer engagement. My approach brings an editorial finish to interior and exterior photography — imagery designed to make prospective buyers pause, explore, and inquire. 48-hour delivery is available.

I would be pleased to serve as a photography resource for your listings. My real estate portfolio, published pricing, and booking are here:
jeffhonforlocophotos.com/providence-real-estate-photographer

Thank you for your consideration.

Best regards,
Jeff Honforloco
Jeff Honforloco Photography
Providence, Rhode Island
jeffhonforlocophotos.com`,
  },
  brand: {
    label: 'Brands / hospitality',
    subject: 'Commercial Photography for {{business_name}}',
    body: `Dear {{business_name}} team,

My name is Jeff Honforloco, a Providence-based photographer specializing in editorial and commercial photography for brands and organizations.

{{business_name}} presents a strong visual identity, and I believe elevated campaign imagery — from product features to behind-the-scenes storytelling — could further strengthen your presence across every platform.

I would welcome the opportunity to discuss your upcoming content needs. My commercial portfolio, published pricing, and booking availability are here:
jeffhonforlocophotos.com/providence-commercial-photographer

Thank you for your time.

Best regards,
Jeff Honforloco
Jeff Honforloco Photography
Providence, Rhode Island
jeffhonforlocophotos.com`,
  },
};
const DEFAULT_TEMPLATE = 'venue';

const AdminOutreach: React.FC = () => {
  const [targets, setTargets] = useState<OutreachTarget[]>([]);
  const [history, setHistory] = useState<SendRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [subject, setSubject] = useState(TEMPLATES[DEFAULT_TEMPLATE].subject);
  const [body, setBody] = useState(TEMPLATES[DEFAULT_TEMPLATE].body);
  const [templateKey, setTemplateKey] = useState(DEFAULT_TEMPLATE);

  const applyTemplate = (key: string) => {
    setTemplateKey(key);
    setSubject(TEMPLATES[key].subject);
    setBody(TEMPLATES[key].body);
  };
  const [sending, setSending] = useState(false);
  const [discovering, setDiscovering] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [tab, setTab] = useState('targets');
  const [postalAddress, setPostalAddress] = useState('');
  const [savingAddr, setSavingAddr] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/v1/admin/outreach/settings'), { headers: authHeaders() });
      const data = await res.json();
      setPostalAddress(data.postal_address ?? '');
    } catch { /* non-fatal */ }
  }, []);

  const savePostalAddress = async () => {
    setSavingAddr(true);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/outreach/settings'), {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify({ postal_address: postalAddress }),
      });
      setNotice(res.ok ? { type: 'ok', text: 'Footer address saved' } : { type: 'err', text: 'Could not save address' });
    } catch {
      setNotice({ type: 'err', text: 'Could not save address' });
    }
    setSavingAddr(false);
  };
  const [importOpen, setImportOpen] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importing, setImporting] = useState(false);

  const fetchTargets = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/v1/admin/outreach/targets'), { headers: authHeaders() });
      const data = await res.json();
      setTargets(data.targets ?? []);
    } catch {
      setNotice({ type: 'err', text: 'Failed to load targets' });
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch(apiUrl('/api/v1/admin/outreach/history'), { headers: authHeaders() });
      const data = await res.json();
      setHistory(data.sends ?? []);
    } catch { /* non-fatal */ }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchTargets(), fetchHistory(), fetchSettings()]);
      setLoading(false);
    })();
  }, [fetchTargets, fetchHistory, fetchSettings]);

  const filtered = targets.filter((t) => {
    const f = filter.toLowerCase();
    return !f || t.business_name.toLowerCase().includes(f) || (t.location ?? '').toLowerCase().includes(f) || (t.category ?? '').toLowerCase().includes(f);
  });

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAllEmailable = () => {
    setSelected(new Set(filtered.filter((t) => t.email && !t.unsubscribed).map((t) => t.id)));
  };

  const selectCategory = (category: string) => {
    setSelected(new Set(targets.filter((t) => t.category === category && t.email && !t.unsubscribed).map((t) => t.id)));
  };

  const discoverEmail = async (id: number) => {
    setDiscovering(id);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/outreach/discover-email'), {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ targetId: id }),
      });
      const data = await res.json();
      if (data.email) {
        setNotice({ type: 'ok', text: `Found: ${data.email}` });
        await fetchTargets();
      } else {
        setNotice({ type: 'err', text: data.error ?? 'No email found on their website' });
      }
    } catch {
      setNotice({ type: 'err', text: 'Email discovery failed' });
    }
    setDiscovering(null);
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const deleteTarget = async (id: number) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setConfirmDeleteId(null);
    await fetch(apiUrl(`/api/v1/admin/outreach/targets/${id}`), { method: 'DELETE', headers: authHeaders() });
    setSelected((prev) => { const n = new Set(prev); n.delete(id); return n; });
    fetchTargets();
  };

  const importTargets = async () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(importJson);
    } catch {
      setNotice({ type: 'err', text: 'Invalid JSON — paste a JSON array of businesses' });
      return;
    }
    if (!Array.isArray(parsed) || !parsed.length) {
      setNotice({ type: 'err', text: 'JSON must be a non-empty array' });
      return;
    }
    setImporting(true);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/outreach/targets/import'), {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ targets: parsed }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotice({ type: 'ok', text: `Imported ${data.imported} businesses${data.skipped ? `, ${data.skipped} skipped` : ''}` });
        setImportOpen(false);
        setImportJson('');
        fetchTargets();
      } else {
        setNotice({ type: 'err', text: data.error ?? 'Import failed' });
      }
    } catch {
      setNotice({ type: 'err', text: 'Import failed' });
    }
    setImporting(false);
  };

  const [confirmSend, setConfirmSend] = useState(false);

  const sendOutreach = async () => {
    if (!selected.size) { setNotice({ type: 'err', text: 'Select at least one target with an email address' }); return; }
    if (!subject.trim() || !body.trim()) { setNotice({ type: 'err', text: 'Subject and message are required' }); return; }
    if (!confirmSend) { setConfirmSend(true); return; }
    setConfirmSend(false);
    setSending(true);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/outreach/send'), {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ targetIds: [...selected], subject, body }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotice({ type: 'ok', text: `Sent ${data.sent} email${data.sent === 1 ? '' : 's'}${data.failed?.length ? `, ${data.failed.length} failed` : ''}` });
        setSelected(new Set());
        fetchHistory();
      } else {
        setNotice({ type: 'err', text: data.error ?? 'Send failed' });
      }
    } catch {
      setNotice({ type: 'err', text: 'Send failed' });
    }
    setSending(false);
  };

  const emailableCount = targets.filter((t) => t.email && !t.unsubscribed).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Outreach</h1>
          <p className="text-sm text-neutral-400">Cold outreach to businesses that need photography — {targets.length} targets, {emailableCount} with email</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { fetchTargets(); fetchHistory(); }}>
          <RefreshCw className="h-4 w-4 mr-2" /> Refresh
        </Button>
      </div>

      {notice && (
        <div className={`rounded-md px-4 py-3 text-sm ${notice.type === 'ok' ? 'bg-emerald-950 text-emerald-200' : 'bg-red-950 text-red-200'}`}>
          {notice.text}
        </div>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="targets"><Building2 className="h-4 w-4 mr-2" /> Targets</TabsTrigger>
          <TabsTrigger value="compose"><PenLine className="h-4 w-4 mr-2" /> Compose ({selected.size})</TabsTrigger>
          <TabsTrigger value="history"><History className="h-4 w-4 mr-2" /> History</TabsTrigger>
        </TabsList>

        <TabsContent value="targets">
          <Card>
            <CardHeader>
              <CardTitle>Business targets</CardTitle>
              <CardDescription>Businesses found by research. Use “Find email” to pull a contact address from their website, then select and compose.</CardDescription>
              <div className="flex gap-2 pt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                  <Input className="pl-9" placeholder="Filter by name, location, category…" value={filter} onChange={(e) => setFilter(e.target.value)} />
                </div>
                <Button variant="outline" size="sm" onClick={selectAllEmailable}>Select all with email</Button>
                <Button variant="outline" size="sm" onClick={() => setSelected(new Set())}>Clear</Button>
                <Button variant="outline" size="sm" onClick={() => setImportOpen((v) => !v)}>Import JSON</Button>
              </div>
              <div className="flex gap-2 pt-2">
                <span className="text-xs text-neutral-500 self-center">Quick select:</span>
                <Button variant="outline" size="sm" onClick={() => { selectCategory('wedding_venue'); applyTemplate('venue'); }}>Venues</Button>
                <Button variant="outline" size="sm" onClick={() => { selectCategory('real_estate'); applyTemplate('real_estate'); }}>Realtors</Button>
                <Button variant="outline" size="sm" onClick={() => { selectCategory('brand'); applyTemplate('brand'); }}>Brands</Button>
              </div>
              {importOpen && (
                <div className="pt-2 space-y-2">
                  <Textarea rows={6} placeholder='Paste a JSON array: [{"business_name":"…","website":"…","category":"…","location":"…","address":"…","phone":"…"}]' value={importJson} onChange={(e) => setImportJson(e.target.value)} className="font-mono text-xs" />
                  <Button size="sm" onClick={importTargets} disabled={importing || !importJson.trim()}>
                    {importing ? 'Importing…' : 'Import businesses'}
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {loading ? <p className="text-neutral-400 text-sm">Loading…</p> : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10" />
                      <TableHead>Business</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-28" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t) => (
                      <TableRow key={t.id} className={t.unsubscribed ? 'opacity-50' : ''}>
                        <TableCell>
                          <Checkbox checked={selected.has(t.id)} disabled={!t.email || !!t.unsubscribed} onCheckedChange={() => toggleSelect(t.id)} />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-white">{t.business_name}</div>
                          <div className="text-xs text-neutral-500">{[t.location, t.address].filter(Boolean).join(' · ')}</div>
                          {t.website && <a href={t.website.startsWith('http') ? t.website : `https://${t.website}`} target="_blank" rel="noreferrer" className="text-xs text-sky-400 hover:underline">website</a>}
                        </TableCell>
                        <TableCell>{t.category && <Badge variant="outline">{t.category}</Badge>}</TableCell>
                        <TableCell className="text-sm">
                          {t.email ? <span className="text-emerald-300">{t.email}</span> : (
                            <Button size="sm" variant="ghost" disabled={discovering === t.id || !t.website} onClick={() => discoverEmail(t.id)}>
                              <Mail className="h-3 w-3 mr-1" /> {discovering === t.id ? 'Finding…' : 'Find email'}
                            </Button>
                          )}
                        </TableCell>
                        <TableCell>{t.unsubscribed ? <Badge variant="destructive">Unsubscribed</Badge> : <Badge variant="secondary">Active</Badge>}</TableCell>
                        <TableCell>
                          {confirmDeleteId === t.id ? (
                            <div className="flex gap-1">
                              <Button size="sm" variant="destructive" onClick={() => deleteTarget(t.id)}>Delete?</Button>
                              <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(null)}>Keep</Button>
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost" onClick={() => deleteTarget(t.id)}><Trash2 className="h-4 w-4 text-red-400" /></Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {!filtered.length && <TableRow><TableCell colSpan={6} className="text-center text-neutral-500 py-8">No targets yet — businesses found by research will appear here.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compose">
          <Card>
            <CardHeader>
              <CardTitle>Compose outreach</CardTitle>
              <CardDescription>Use {`{{business_name}}`} to personalize per business. Every email includes an unsubscribe link automatically.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-neutral-300">Recipients: {selected.size} selected</label>
              </div>
              <div>
                <label className="text-sm text-neutral-300">Template</label>
                <div className="flex gap-2 mt-1">
                  {Object.entries(TEMPLATES).map(([key, t]) => (
                    <Button key={key} size="sm" variant={templateKey === key ? 'default' : 'outline'} onClick={() => applyTemplate(key)}>
                      {t.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-neutral-300">Subject</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm text-neutral-300">Message</label>
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={14} className="mt-1 font-serif" />
              </div>
              <div>
                <label className="text-sm text-neutral-300">Footer postal address <span className="text-neutral-500">(required on cold emails — use a P.O. box or business address, never your home)</span></label>
                <div className="flex gap-2 mt-1">
                  <Input value={postalAddress} onChange={(e) => setPostalAddress(e.target.value)} placeholder="e.g. PO Box 1234, Providence, RI 02903" className="flex-1" />
                  <Button variant="outline" size="sm" onClick={savePostalAddress} disabled={savingAddr}>{savingAddr ? 'Saving…' : 'Save'}</Button>
                </div>
                {!postalAddress.trim() && <p className="text-xs text-amber-400 mt-1">No address set — emails will show "Providence, RI", which is not compliant for cold outreach.</p>}
              </div>
              {confirmSend ? (
                <div className="flex gap-2 items-center">
                  <Button variant="destructive" onClick={sendOutreach} disabled={sending}>
                    <Send className="h-4 w-4 mr-2" /> {sending ? 'Sending…' : `Confirm send to ${selected.size} businesses`}
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmSend(false)}>Cancel</Button>
                </div>
              ) : (
                <Button onClick={sendOutreach} disabled={sending || !selected.size}>
                  <Send className="h-4 w-4 mr-2" /> {sending ? 'Sending…' : `Send to ${selected.size} businesses`}
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader><CardTitle>Send history</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Business</TableHead><TableHead>Email</TableHead><TableHead>Subject</TableHead><TableHead>Sent</TableHead></TableRow></TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="text-white">{h.business_name}</TableCell>
                      <TableCell className="text-sm text-neutral-400">{h.email}</TableCell>
                      <TableCell className="text-sm">{h.subject}</TableCell>
                      <TableCell className="text-sm text-neutral-500">{new Date(h.sent_at + 'Z').toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  {!history.length && <TableRow><TableCell colSpan={4} className="text-center text-neutral-500 py-8">No emails sent yet.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminOutreach;
