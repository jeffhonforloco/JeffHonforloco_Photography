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

const DEFAULT_SUBJECT = 'Photography for {{business_name}}';
const DEFAULT_BODY = `Hi there,

I'm Jeff, a Providence-based photographer specializing in editorial, commercial and event photography across Rhode Island and New England.

I came across {{business_name}} and wanted to reach out — I help businesses like yours with standout visual content: venue showcases, branding portraits, listing and property photography, and event coverage.

Would you be open to a quick call to see if there's a fit? You can see my work at jeffhonforlocophotos.com.

Best,
Jeff Honforloco
Jeff Honforloco Photography`;

const AdminOutreach: React.FC = () => {
  const [targets, setTargets] = useState<OutreachTarget[]>([]);
  const [history, setHistory] = useState<SendRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY);
  const [sending, setSending] = useState(false);
  const [discovering, setDiscovering] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [tab, setTab] = useState('targets');
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
      await Promise.all([fetchTargets(), fetchHistory()]);
      setLoading(false);
    })();
  }, [fetchTargets, fetchHistory]);

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

  const sendOutreach = async () => {
    if (!selected.size) { setNotice({ type: 'err', text: 'Select at least one target with an email address' }); return; }
    if (!subject.trim() || !body.trim()) { setNotice({ type: 'err', text: 'Subject and message are required' }); return; }
    if (!window.confirm(`Send to ${selected.size} businesses?`)) return;
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
                <label className="text-sm text-neutral-300">Subject</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1" />
              </div>
              <div>
                <label className="text-sm text-neutral-300">Message</label>
                <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={14} className="mt-1 font-serif" />
              </div>
              <Button onClick={sendOutreach} disabled={sending || !selected.size}>
                <Send className="h-4 w-4 mr-2" /> {sending ? 'Sending…' : `Send to ${selected.size} businesses`}
              </Button>
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
