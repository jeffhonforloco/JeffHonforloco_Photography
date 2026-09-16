import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { apiUrl } from '@/lib/api-base';
import {
  Mail, CalendarDays, Megaphone, Send, Clock, RefreshCw, Eye, MousePointerClick,
  Plus, Users, AlertCircle, CheckCircle2, FlaskConical, Trash2, Target,
  Image as ImageIcon, ExternalLink, Info,
} from 'lucide-react';

/* ------------------------------------------------------------------ */

const authHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

const TABS = [
  { key: 'email', label: 'Email', icon: Mail },
  { key: 'social', label: 'Social', icon: CalendarDays },
  { key: 'ads', label: 'Ads', icon: Megaphone },
] as const;

type TabKey = typeof TABS[number]['key'];

interface EmailCampaign {
  id: number; subject: string; audience: string;
  recipient_count: number; sent_count: number; failed_count: number;
  status: string; scheduled_for: string | null; sent_at: string | null; created_at: string;
  opens: number; clicks: number; unique_opens: number; unique_clicks: number;
}

interface SocialCampaign {
  id: number; name: string; theme: string; start_date: string; end_date: string;
  posts_per_week: number; status: string; created_at: string;
  post_count: number; done_count: number;
}

interface SocialPost {
  id: number; scheduled_date: string; pillar: string; caption_prompt: string; status: string;
}

interface AdDraft {
  id: number; platform: string; name: string; objective: string;
  budget_amount: number | null; budget_type: string; currency: string;
  start_date: string | null; end_date: string | null; status: string; created_at: string;
  targeting: Record<string, unknown>; creative: Record<string, unknown>;
}

const pct = (n: number, d: number) => (d > 0 ? `${Math.round((n / d) * 100)}%` : '—');

/* ================================================================== */
/* EMAIL TAB                                                          */
/* ================================================================== */

const EmailTab: React.FC = () => {
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [subject, setSubject] = useState('');
  const [audience, setAudience] = useState('all');
  const [customEmails, setCustomEmails] = useState('');
  const [body, setBody] = useState('<p>Hi {name},</p>\n<p></p>\n<p>— Jeff</p>');
  const [scheduleFor, setScheduleFor] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);

  const [detail, setDetail] = useState<{ campaign: EmailCampaign & { body_html?: string }; recipients: Array<{ email: string; name: string | null; source: string; status: string; error: string | null; sent_at: string | null }>; events: Array<{ event_type: string; n: number; unique_n: number }> } | null>(null);

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(null), 5000); };

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(apiUrl('/api/v1/admin/campaigns/email'), { headers: authHeaders() });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.error || 'Failed to load campaigns');
      setCampaigns(d.data.campaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAudienceCount = useCallback(async (aud: string) => {
    if (aud === 'custom') { setAudienceCount(null); return; }
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/campaigns/email/audience-count?audience=${aud}`), { headers: authHeaders() });
      const d = await res.json();
      if (res.ok && d.success) setAudienceCount(d.data.count);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { void fetchCampaigns(); }, [fetchCampaigns]);
  useEffect(() => { void fetchAudienceCount(audience); }, [audience, fetchAudienceCount]);

  const openDetail = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/campaigns/email/${id}`), { headers: authHeaders() });
      const d = await res.json();
      if (res.ok && d.success) setDetail(d.data);
      else setError(d.error || 'Failed to load campaign details');
    } catch {
      setError('Failed to load campaign details');
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) { setError('Subject and body are required.'); return; }
    const custom = customEmails.split(/[\n,;]+/).map((e) => e.trim()).filter(Boolean);
    setSending(true); setError(null);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/campaigns/email'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          subject: subject.trim(),
          body_html: body,
          audience,
          custom_emails: custom,
          schedule_for: scheduleFor || null,
        }),
      });
      const d = await res.json();
      if (d.needsResend) {
        setError(d.message || 'Add RESEND_API_KEY to worker secrets to send.');
      } else if (!res.ok || !d.success) {
        throw new Error(d.error || 'Failed to create campaign');
      } else {
        flash(scheduleFor ? 'Campaign scheduled.' : 'Campaign is sending in the background.');
        setSubject(''); setCustomEmails(''); setScheduleFor('');
        setBody('<p>Hi {name},</p>\n<p></p>\n<p>— Jeff</p>');
        void fetchCampaigns();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail.trim()) return;
    setTestSending(true); setError(null);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/campaigns/email/test'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ to: testEmail.trim(), subject: subject.trim() || 'Test email', body_html: body }),
      });
      const d = await res.json();
      if (d.needsResend) setError(d.message);
      else if (!res.ok || !d.success) throw new Error(d.error || 'Test send failed');
      else flash(`Test email sent to ${testEmail.trim()}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Test send failed');
    } finally {
      setTestSending(false);
    }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      sent: 'bg-emerald-100 text-emerald-800', sending: 'bg-blue-100 text-blue-800',
      scheduled: 'bg-amber-100 text-amber-800', draft: 'bg-neutral-900 text-neutral-400',
    };
    return <Badge className={map[s] || 'bg-neutral-900 text-neutral-400'}>{s}</Badge>;
  };

  return (
    <div className="space-y-6">
      {error && <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {notice && <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{notice}</div>}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" /> Compose email campaign</CardTitle>
          <CardDescription>
            Sends via Resend to your contacts + leads. Unsubscribes are respected automatically.
            Use <code className="rounded bg-neutral-900 px-1">{'{name}'}</code> to personalize.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Fall mini sessions are open 📸" />
            </div>
            <div className="space-y-2">
              <Label>Audience {audienceCount !== null && <span className="font-normal text-neutral-400">({audienceCount} recipients)</span>}</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone (contacts + leads)</SelectItem>
                  <SelectItem value="contacts">Contacts only</SelectItem>
                  <SelectItem value="leads">Leads only</SelectItem>
                  <SelectItem value="custom">Custom list</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {audience === 'custom' && (
            <div className="space-y-2">
              <Label>Custom emails (one per line or comma-separated)</Label>
              <Textarea rows={3} value={customEmails} onChange={(e) => setCustomEmails(e.target.value)} placeholder="client@example.com&#10;friend@example.com" />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Body (HTML allowed)</Label>
              <Button variant="outline" size="sm" onClick={() => setShowPreview((v) => !v)}>
                <Eye className="mr-1 h-3.5 w-3.5" /> {showPreview ? 'Edit' : 'Preview'}
              </Button>
            </div>
            {showPreview ? (
              <div className="rounded-lg border bg-neutral-950 p-4 text-sm" dangerouslySetInnerHTML={{ __html: body.split('{name}').join('there') }} />
            ) : (
              <Textarea rows={8} value={body} onChange={(e) => setBody(e.target.value)} className="font-mono text-sm" />
            )}
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-2">
              <Label>Schedule (optional)</Label>
              <Input type="datetime-local" value={scheduleFor} onChange={(e) => setScheduleFor(e.target.value)} />
            </div>
            <Button onClick={handleSend} disabled={sending}>
              {sending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : scheduleFor ? <Clock className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
              {scheduleFor ? 'Schedule' : 'Send now'}
            </Button>
            <div className="flex items-end gap-2">
              <div className="space-y-2">
                <Label>Test address</Label>
                <Input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="you@example.com" className="w-52" />
              </div>
              <Button variant="outline" onClick={handleTest} disabled={testSending}>
                <FlaskConical className="mr-2 h-4 w-4" /> Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Campaign history</CardTitle>
              <CardDescription>Opens and clicks are tracked via Resend webhooks.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => void fetchCampaigns()}><RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh</Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-neutral-400">Loading…</p>
          ) : campaigns.length === 0 ? (
            <p className="text-sm text-neutral-400">No campaigns yet. Compose your first one above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-neutral-400">
                    <th className="py-2 pr-3">Subject</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Sent</th>
                    <th className="py-2 pr-3">Failed</th>
                    <th className="py-2 pr-3"><span className="inline-flex items-center gap-1"><Eye className="h-3 w-3" /> Opens</span></th>
                    <th className="py-2 pr-3"><span className="inline-flex items-center gap-1"><MousePointerClick className="h-3 w-3" /> Clicks</span></th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((c) => (
                    <tr key={c.id} className="cursor-pointer border-b hover:bg-neutral-900" onClick={() => void openDetail(c.id)}>
                      <td className="max-w-64 truncate py-2 pr-3 font-medium">{c.subject}</td>
                      <td className="py-2 pr-3">{statusBadge(c.status)}</td>
                      <td className="py-2 pr-3">{c.sent_count}/{c.recipient_count}</td>
                      <td className="py-2 pr-3">{c.failed_count}</td>
                      <td className="py-2 pr-3">{pct(c.unique_opens, c.sent_count)}</td>
                      <td className="py-2 pr-3">{pct(c.unique_clicks, c.sent_count)}</td>
                      <td className="py-2 text-xs text-neutral-400">{new Date(c.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detail} onOpenChange={(o) => { if (!o) setDetail(null); }}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detail?.campaign.subject}</DialogTitle>
            <DialogDescription>
              {detail && <>Status: {detail.campaign.status} · Audience: {detail.campaign.audience} · Recipients: {detail.campaign.recipient_count}</>}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {detail.events.map((e) => (
                  <Badge key={e.event_type} variant="outline">{e.event_type}: {e.n} ({e.unique_n} unique)</Badge>
                ))}
                {detail.events.length === 0 && <span className="text-sm text-neutral-400">No events yet.</span>}
              </div>
              <div className="max-h-72 overflow-y-auto rounded-lg border">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-neutral-900">
                    <tr className="text-left text-neutral-400"><th className="p-2">Email</th><th className="p-2">Name</th><th className="p-2">Source</th><th className="p-2">Status</th></tr>
                  </thead>
                  <tbody>
                    {detail.recipients.map((r) => (
                      <tr key={r.email} className="border-t">
                        <td className="p-2">{r.email}</td>
                        <td className="p-2">{r.name || '—'}</td>
                        <td className="p-2">{r.source}</td>
                        <td className="p-2">{r.status === 'failed' ? <span className="text-red-600" title={r.error || ''}>failed</span> : r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/* ================================================================== */
/* SOCIAL TAB                                                         */
/* ================================================================== */

const PILLAR_LABELS: Record<string, string> = {
  portfolio: 'Portfolio Drop',
  'behind-scenes': 'Behind the Scenes',
  'client-story': 'Client Story',
  'booking-cta': 'Booking CTA',
  education: 'Tip / Education',
};

const SocialTab: React.FC = () => {
  const [campaigns, setCampaigns] = useState<SocialCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [form, setForm] = useState({ name: '', theme: '', start_date: '', end_date: '', posts_per_week: '2', notes: '' });
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<SocialCampaign | null>(null);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(null), 5000); };

  const fetchCampaigns = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(apiUrl('/api/v1/admin/campaigns/social'), { headers: authHeaders() });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.error || 'Failed to load campaigns');
      setCampaigns(d.data.campaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchCampaigns(); }, [fetchCampaigns]);

  const openCampaign = async (c: SocialCampaign) => {
    setSelected(c); setDetailLoading(true); setError(null);
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/campaigns/social/${c.id}`), { headers: authHeaders() });
      const d = await res.json();
      if (res.ok && d.success) setPosts(d.data.posts);
      else setError(d.error || 'Failed to load content calendar');
    } catch {
      setError('Failed to load content calendar');
    }
    finally { setDetailLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.theme.trim() || !form.start_date || !form.end_date) {
      setError('Name, theme, start and end dates are required.'); return;
    }
    setCreating(true); setError(null);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/campaigns/social'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          name: form.name.trim(),
          theme: form.theme.trim(),
          start_date: form.start_date,
          end_date: form.end_date,
          posts_per_week: Number(form.posts_per_week),
          notes: form.notes.trim() || undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.error || 'Failed to create campaign');
      flash(`Campaign created with ${d.data.post_count} planned posts.`);
      setForm({ name: '', theme: '', start_date: '', end_date: '', posts_per_week: '2', notes: '' });
      void fetchCampaigns();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };

  const markPost = async (postId: number, status: string) => {
    const prev = posts.find((p) => p.id === postId)?.status;
    setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, status } : p)));
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/campaigns/social/posts/${postId}`), {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Update failed');
      }
    } catch (err) {
      // revert the optimistic update so the UI stays truthful
      setPosts((prevPosts) => prevPosts.map((p) => (p.id === postId ? { ...p, status: prev || p.status } : p)));
      setError(err instanceof Error ? err.message : 'Failed to update post');
    }
  };

  return (
    <div className="space-y-6">
      {error && <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {notice && <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{notice}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5" /> New social campaign</CardTitle>
            <CardDescription>
              Plans a content calendar around a theme. Slots feed your existing IG publishing queue —
              mark each post queued/published as you schedule it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Fall Fashion Push" /></div>
              <div className="space-y-2"><Label>Theme</Label><Input value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} placeholder="fall fashion editorials" /></div>
              <div className="space-y-2"><Label>Start date</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>End date</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>Posts per week</Label>
                <Select value={form.posts_per_week} onValueChange={(v) => setForm({ ...form, posts_per_week: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['1','2','3','4','5','6','7'].map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Notes (optional)</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Focus on Providence brides" /></div>
            </div>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Generate calendar
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
            <CardDescription>{campaigns.length} campaign(s)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? <p className="text-sm text-neutral-400">Loading…</p> :
              campaigns.length === 0 ? <p className="text-sm text-neutral-400">No social campaigns yet.</p> :
              campaigns.map((c) => (
                <button key={c.id} onClick={() => void openCampaign(c)}
                  className={`w-full rounded-lg border p-3 text-left transition hover:bg-neutral-900 ${selected?.id === c.id ? 'border-blue-400 ring-1 ring-blue-200' : ''}`}>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{c.name}</p>
                    <Badge variant="outline">{c.done_count}/{c.post_count} done</Badge>
                  </div>
                  <p className="mt-1 text-xs text-neutral-400">{c.theme} · {c.start_date} → {c.end_date} · {c.posts_per_week}/wk</p>
                </button>
              ))}
          </CardContent>
        </Card>
      </div>

      {selected && (
        <Card>
          <CardHeader>
            <CardTitle>{selected.name} — content calendar</CardTitle>
            <CardDescription>Tap a post to mark it queued or published as you schedule it in your publisher.</CardDescription>
          </CardHeader>
          <CardContent>
            {detailLoading ? <p className="text-sm text-neutral-400">Loading…</p> : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((p) => (
                  <div key={p.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-neutral-400">{p.scheduled_date}</span>
                      <Badge className={
                        p.status === 'published' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'queued' ? 'bg-blue-100 text-blue-800' :
                        p.status === 'skipped' ? 'bg-neutral-900 text-neutral-400' : 'bg-amber-100 text-amber-800'
                      }>{p.status}</Badge>
                    </div>
                    <p className="mt-1 text-sm font-medium">{PILLAR_LABELS[p.pillar] || p.pillar}</p>
                    <p className="mt-1 text-xs text-neutral-400">{p.caption_prompt}</p>
                    <div className="mt-2 flex gap-1">
                      {['planned', 'queued', 'published', 'skipped'].map((s) => (
                        <button key={s} onClick={() => void markPost(p.id, s)}
                          className={`rounded px-2 py-1 text-[11px] ${p.status === s ? 'bg-slate-900 text-white' : 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

/* ================================================================== */
/* ADS TAB                                                            */
/* ================================================================== */

const AD_OBJECTIVES = [
  { value: 'bookings', label: 'Bookings (conversions)' },
  { value: 'leads', label: 'Leads (form fills)' },
  { value: 'traffic', label: 'Traffic (site visits)' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'awareness', label: 'Awareness / Reach' },
];

const AdsTab: React.FC = () => {
  const [drafts, setDrafts] = useState<AdDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    platform: 'meta', name: '', objective: 'bookings',
    budget_amount: '20', budget_type: 'daily', currency: 'USD',
    start_date: '', end_date: '',
    locations: 'Providence, RI (25 mi)', age_min: '22', age_max: '45', genders: 'all', interests: 'fashion photography, weddings, portrait photography',
    headline: '', primary_text: '', image_url: '', cta_url: 'https://jeffhonforlocophotos.com/book/',
  });

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(null), 6000); };

  const fetchDrafts = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(apiUrl('/api/v1/admin/campaigns/ads/drafts'), { headers: authHeaders() });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.error || 'Failed to load drafts');
      setDrafts(d.data.drafts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load drafts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchDrafts(); }, [fetchDrafts]);

  const handleSave = async () => {
    if (!form.name.trim()) { setError('Campaign name is required.'); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/campaigns/ads/draft'), {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          platform: form.platform,
          name: form.name.trim(),
          objective: form.objective,
          budget_amount: Number(form.budget_amount) || null,
          budget_type: form.budget_type,
          currency: form.currency,
          start_date: form.start_date || null,
          end_date: form.end_date || null,
          targeting: {
            locations: form.locations, age_min: Number(form.age_min) || null,
            age_max: Number(form.age_max) || null, genders: form.genders, interests: form.interests,
          },
          creative: {
            headline: form.headline, primary_text: form.primary_text,
            image_url: form.image_url, cta_url: form.cta_url,
          },
        }),
      });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.error || 'Failed to save draft');
      flash(d.data?.message || 'Draft saved.');
      setForm({ ...form, name: '', headline: '', primary_text: '', image_url: '' });
      void fetchDrafts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this draft?')) return;
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/campaigns/ads/draft/${id}`), { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Delete failed');
      }
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <div className="space-y-6">
      {error && <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {notice && <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800"><Info className="mt-0.5 h-4 w-4 shrink-0" />{notice}</div>}

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> New ad campaign draft</CardTitle>
            <CardDescription>
              Drafts are saved here. Launching to Meta/Google needs your ad accounts connected (see checklist).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Platform</Label>
                <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meta">Meta (Facebook + Instagram)</SelectItem>
                    <SelectItem value="google">Google Ads</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Campaign name</Label><Input value={form.name} onChange={set('name')} placeholder="Fall bookings — Providence" /></div>
              <div className="space-y-2"><Label>Objective</Label>
                <Select value={form.objective} onValueChange={(v) => setForm({ ...form, objective: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{AD_OBJECTIVES.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2"><Label>Budget</Label><Input type="number" min="1" value={form.budget_amount} onChange={set('budget_amount')} /></div>
                <div className="space-y-2"><Label>Type</Label>
                  <Select value={form.budget_type} onValueChange={(v) => setForm({ ...form, budget_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="daily">Daily</SelectItem><SelectItem value="lifetime">Lifetime</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label>Start date</Label><Input type="date" value={form.start_date} onChange={set('start_date')} /></div>
              <div className="space-y-2"><Label>End date</Label><Input type="date" value={form.end_date} onChange={set('end_date')} /></div>
            </div>

            <div className="rounded-lg border p-3">
              <p className="mb-3 text-sm font-medium">Targeting</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Locations</Label><Input value={form.locations} onChange={set('locations')} /></div>
                <div className="space-y-2"><Label>Interests</Label><Input value={form.interests} onChange={set('interests')} /></div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-2"><Label>Age min</Label><Input type="number" value={form.age_min} onChange={set('age_min')} /></div>
                  <div className="space-y-2"><Label>Age max</Label><Input type="number" value={form.age_max} onChange={set('age_max')} /></div>
                  <div className="space-y-2"><Label>Gender</Label>
                    <Select value={form.genders} onValueChange={(v) => setForm({ ...form, genders: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="women">Women</SelectItem><SelectItem value="men">Men</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border p-3">
              <p className="mb-3 text-sm font-medium">Creative</p>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Headline</Label><Input value={form.headline} onChange={set('headline')} placeholder="Providence Fashion Photographer — Book Your Shoot" /></div>
                <div className="space-y-2"><Label>Primary text</Label><Textarea rows={3} value={form.primary_text} onChange={set('primary_text')} placeholder="Editorial, beauty & branding shoots in Providence & Boston. Limited fall slots…" /></div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2"><Label>Image URL</Label><Input value={form.image_url} onChange={set('image_url')} placeholder="https://…" /></div>
                  <div className="space-y-2"><Label>CTA link</Label><Input value={form.cta_url} onChange={set('cta_url')} /></div>
                </div>
                {form.image_url && (
                  <div className="flex items-start gap-3 rounded-lg bg-neutral-900 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={form.image_url} alt="Ad creative preview" className="h-20 w-20 rounded object-cover" />
                    <div className="text-sm">
                      <p className="font-medium">{form.headline || 'Headline'}</p>
                      <p className="text-xs text-neutral-400 line-clamp-2">{form.primary_text || 'Primary text…'}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Save draft
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Connect to launch</CardTitle>
              <CardDescription>Drafts stay here until an ad account is connected.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="font-medium">Meta (Facebook/Instagram)</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-neutral-400">
                  <li>Business Manager + ad account with a payment method</li>
                  <li>Connect via Marketing API OAuth (app review for ads_management, ads_read)</li>
                  <li>Then drafts can be pushed as real campaigns</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">Google Ads</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-neutral-400">
                  <li>Google Ads account + Google Ads API developer token</li>
                  <li>OAuth consent for adwords scope</li>
                  <li>Then drafts can be pushed as real campaigns</li>
                </ul>
              </div>
              <p className="flex items-start gap-1 text-xs text-neutral-400">
                <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
                Tell Vytre "connect my Meta/Google ad account" when you're ready and the launch wiring will be built.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Saved drafts</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {loading ? <p className="text-sm text-neutral-400">Loading…</p> :
                drafts.length === 0 ? <p className="text-sm text-neutral-400">No drafts yet.</p> :
                drafts.map((d) => (
                  <div key={d.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{d.name}</p>
                      <button onClick={() => void handleDelete(d.id)} className="text-slate-400 hover:text-red-600" aria-label="Delete draft">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      <Badge variant="outline">{d.platform}</Badge>
                      <Badge variant="outline">{d.objective}</Badge>
                      {d.budget_amount ? <Badge variant="outline">${d.budget_amount}/{d.budget_type}</Badge> : null}
                      <Badge className="bg-amber-100 text-amber-800">draft — needs ad account</Badge>
                    </div>
                    {String((d.creative as Record<string, unknown>).headline || '') && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-neutral-400">
                        <ImageIcon className="h-3 w-3" /> {String((d.creative as Record<string, unknown>).headline)}
                      </p>
                    )}
                  </div>
                ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

/* ================================================================== */
/* MAIN                                                               */
/* ================================================================== */

const AdminCampaigns: React.FC = () => {
  const [tab, setTab] = useState<TabKey>('email');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Users className="h-6 w-6" /> Campaigns
        </h1>
        <p className="text-sm text-neutral-400">Email blasts, social content plans, and ad drafts — one command center.</p>
      </div>

      <div className="flex gap-1 rounded-lg border bg-neutral-950 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
              tab === t.key ? 'bg-slate-900 text-white' : 'text-neutral-400 hover:bg-neutral-900'
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'email' && <EmailTab />}
      {tab === 'social' && <SocialTab />}
      {tab === 'ads' && <AdsTab />}
    </div>
  );
};

export default AdminCampaigns;
