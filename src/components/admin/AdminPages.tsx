import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { apiUrl } from '@/lib/api-base';
import {
  Plus, RefreshCw, Trash2, Eye, Pencil, Save, X,
  Type, Image as ImageIcon, LayoutGrid, MousePointerClick, Star,
  ArrowUp, ArrowDown, CheckCircle2, AlertCircle, Globe,
} from 'lucide-react';

/* ------------------------------------------------------------------ */

type Block =
  | { type: 'hero'; heading: string; subheading?: string; imageUrl?: string; ctaText?: string; ctaUrl?: string }
  | { type: 'text'; heading?: string; body: string }
  | { type: 'image'; imageUrl: string; caption?: string }
  | { type: 'gallery'; imageUrls: string[] }
  | { type: 'cta'; heading: string; text?: string; buttonText: string; buttonUrl: string };

interface PageItem {
  id: number; slug: string; title: string;
  is_published: number; updated_at: string; created_at: string;
}

interface PageDetail extends PageItem {
  content: Block[]; meta_description: string | null; url: string;
}

const BLOCK_META: Record<Block['type'], { label: string; icon: React.ElementType; blank: Block }> = {
  hero: { label: 'Hero', icon: Star, blank: { type: 'hero', heading: '', subheading: '', imageUrl: '', ctaText: '', ctaUrl: '' } },
  text: { label: 'Text', icon: Type, blank: { type: 'text', heading: '', body: '' } },
  image: { label: 'Image', icon: ImageIcon, blank: { type: 'image', imageUrl: '', caption: '' } },
  gallery: { label: 'Gallery', icon: LayoutGrid, blank: { type: 'gallery', imageUrls: [] } },
  cta: { label: 'Call to Action', icon: MousePointerClick, blank: { type: 'cta', heading: '', text: '', buttonText: '', buttonUrl: '' } },
};

const authHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

/* ------------------------------------------------------------------ */

function BlockEditor({ block, onChange, onRemove, onMoveUp, onMoveDown }: {
  block: Block; onChange: (b: Block) => void; onRemove: () => void; onMoveUp: () => void; onMoveDown: () => void;
}) {
  const meta = BLOCK_META[block.type];
  const Icon = meta.icon;
  const set = (patch: Partial<Block>) => onChange({ ...block, ...patch } as Block);

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <Icon className="h-3.5 w-3.5" />{meta.label}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={onMoveUp} aria-label="Move up"><ArrowUp className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={onMoveDown} aria-label="Move down"><ArrowDown className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="sm" onClick={onRemove} aria-label="Remove block"><X className="h-3.5 w-3.5 text-rose-600" /></Button>
        </div>
      </div>
      <div className="space-y-3 p-4">
        {block.type === 'hero' && (<>
          <div><Label className="text-xs">Heading *</Label><Input className="mt-1" value={block.heading} onChange={(e) => set({ heading: e.target.value })} placeholder="Big headline" /></div>
          <div><Label className="text-xs">Subheading</Label><Input className="mt-1" value={block.subheading || ''} onChange={(e) => set({ subheading: e.target.value })} placeholder="Supporting line" /></div>
          <div><Label className="text-xs">Background image URL</Label><Input className="mt-1" value={block.imageUrl || ''} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://..." /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Button text</Label><Input className="mt-1" value={block.ctaText || ''} onChange={(e) => set({ ctaText: e.target.value })} placeholder="Book Now" /></div>
            <div><Label className="text-xs">Button link</Label><Input className="mt-1" value={block.ctaUrl || ''} onChange={(e) => set({ ctaUrl: e.target.value })} placeholder="/book" /></div>
          </div>
        </>)}
        {block.type === 'text' && (<>
          <div><Label className="text-xs">Heading</Label><Input className="mt-1" value={block.heading || ''} onChange={(e) => set({ heading: e.target.value })} placeholder="Section heading" /></div>
          <div><Label className="text-xs">Body *</Label><Textarea className="mt-1" rows={4} value={block.body} onChange={(e) => set({ body: e.target.value })} placeholder="Write your content... (blank lines = new paragraphs)" /></div>
        </>)}
        {block.type === 'image' && (<>
          <div><Label className="text-xs">Image URL *</Label><Input className="mt-1" value={block.imageUrl} onChange={(e) => set({ imageUrl: e.target.value })} placeholder="https://... (paste from Media Library)" /></div>
          <div><Label className="text-xs">Caption</Label><Input className="mt-1" value={block.caption || ''} onChange={(e) => set({ caption: e.target.value })} placeholder="Optional caption" /></div>
          {block.imageUrl && <img src={block.imageUrl} alt="" className="h-32 rounded-lg object-cover" />}
        </>)}
        {block.type === 'gallery' && (
          <div>
            <Label className="text-xs">Image URLs * <span className="text-muted-foreground">(one per line)</span></Label>
            <Textarea className="mt-1 font-mono text-xs" rows={4}
              value={block.imageUrls.join('\n')}
              onChange={(e) => set({ imageUrls: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })}
              placeholder={'https://...\nhttps://...'} />
          </div>
        )}
        {block.type === 'cta' && (<>
          <div><Label className="text-xs">Heading *</Label><Input className="mt-1" value={block.heading} onChange={(e) => set({ heading: e.target.value })} placeholder="Ready to book your shoot?" /></div>
          <div><Label className="text-xs">Text</Label><Textarea className="mt-1" rows={2} value={block.text || ''} onChange={(e) => set({ text: e.target.value })} placeholder="Short persuasive line" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Button text *</Label><Input className="mt-1" value={block.buttonText} onChange={(e) => set({ buttonText: e.target.value })} placeholder="Book Now" /></div>
            <div><Label className="text-xs">Button link *</Label><Input className="mt-1" value={block.buttonUrl} onChange={(e) => set({ buttonUrl: e.target.value })} placeholder="/book" /></div>
          </div>
        </>)}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const AdminPages: React.FC = () => {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editing, setEditing] = useState<PageDetail | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [meta, setMeta] = useState('');
  const [published, setPublished] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [addType, setAddType] = useState<Block['type']>('text');

  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 4000); };

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(apiUrl('/api/v1/admin/pages'), { headers: authHeaders() });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.error || 'Failed to load pages');
      setPages(d.data.pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchPages(); }, [fetchPages]);

  const openNew = () => {
    setEditing(null); setTitle(''); setSlug(''); setMeta(''); setPublished(false); setBlocks([]);
  };

  const openEdit = async (p: PageItem) => {
    try {
      setEditLoading(true); setError(null);
      const res = await fetch(apiUrl(`/api/v1/admin/pages/${p.id}`), { headers: authHeaders() });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.error || 'Failed to load page');
      const det: PageDetail = d.data;
      setEditing(det); setTitle(det.title); setSlug(det.slug);
      setMeta(det.meta_description || ''); setPublished(det.is_published === 1);
      setBlocks(det.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page');
    } finally {
      setEditLoading(false);
    }
  };

  const save = async () => {
    if (!title.trim()) { setError('Title is required'); return; }
    try {
      setSaving(true); setError(null);
      const payload = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        content: blocks,
        meta_description: meta.trim() || undefined,
        is_published: published,
      };
      const url = editing ? apiUrl(`/api/v1/admin/pages/${editing.id}`) : apiUrl('/api/v1/admin/pages');
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.error || 'Save failed');
      flash(editing ? 'Page updated' : `Page created — live at /${d.data.slug}`);
      setEditing(null);
      void fetchPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p: PageItem) => {
    if (!confirm(`Delete "${p.title}"?`)) return;
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/pages/${p.id}`), { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error('Delete failed');
      flash('Page deleted');
      void fetchPages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const addBlock = () => setBlocks((b) => [...b, { ...BLOCK_META[addType].blank } as Block]);
  const moveBlock = (i: number, dir: -1 | 1) => {
    setBlocks((b) => {
      const j = i + dir;
      if (j < 0 || j >= b.length) return b;
      const next = [...b];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const isEditorOpen = editing !== null || title !== '' || blocks.length > 0 || slug !== '';

  /* ================= editor ================= */
  if (isEditorOpen || editing) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight">{editing ? 'Edit Page' : 'New Page'}</h1>
            <p className="text-sm text-muted-foreground">
              {editing ? `/${editing.slug}` : 'Build with content blocks, then publish'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={published} onCheckedChange={setPublished} />
              <span className="font-medium">{published ? 'Published' : 'Draft'}</span>
            </label>
            <Button variant="outline" size="sm" onClick={() => { setEditing(null); setTitle(''); setSlug(''); setMeta(''); setPublished(false); setBlocks([]); }}>
              Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={saving} className="bg-rose-600 hover:bg-rose-700">
              <Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {error && <div className="flex items-start gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}

        {editLoading ? <p className="text-sm text-muted-foreground">Loading...</p> : (<>
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              <div><Label>Page title *</Label><Input className="mt-1.5" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Portraits" /></div>
              <div><Label>URL slug</Label>
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="text-sm text-muted-foreground">/</span>
                  <Input value={slug} onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="auto-from-title" />
                </div>
              </div>
              <div className="md:col-span-2"><Label>Meta description <span className="text-muted-foreground">(SEO)</span></Label>
                <Input className="mt-1.5" value={meta} onChange={(e) => setMeta(e.target.value)} placeholder="One sentence for Google" maxLength={300} />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {blocks.map((b, i) => (
              <BlockEditor key={i} block={b}
                onChange={(nb) => setBlocks((prev) => prev.map((x, j) => (j === i ? nb : x)))}
                onRemove={() => setBlocks((prev) => prev.filter((_, j) => j !== i))}
                onMoveUp={() => moveBlock(i, -1)} onMoveDown={() => moveBlock(i, 1)} />
            ))}
          </div>

          <Card className="border-dashed border-slate-300">
            <CardContent className="flex flex-wrap items-center gap-2 p-4">
              <Select value={addType} onValueChange={(v) => setAddType(v as Block['type'])}>
                <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(BLOCK_META) as Block['type'][]).map((t) => (
                    <SelectItem key={t} value={t}>{BLOCK_META[t].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={addBlock}><Plus className="mr-2 h-4 w-4" />Add block</Button>
              {blocks.length === 0 && <span className="text-xs text-muted-foreground">Add your first content block to start building</span>}
            </CardContent>
          </Card>
        </>)}
      </div>
    );
  }

  /* ================= list ================= */
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight">Pages</h1>
          <p className="text-sm text-muted-foreground">Create landing pages that go live on your site instantly</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchPages} variant="outline" size="sm"><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
          <Button onClick={openNew} size="sm" className="bg-rose-600 hover:bg-rose-700"><Plus className="mr-2 h-4 w-4" />New Page</Button>
        </div>
      </div>

      {error && <div className="flex items-start gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {success && <div className="flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{success}</div>}

      {loading ? <p className="text-sm text-muted-foreground">Loading pages...</p>
        : pages.length === 0 ? (
          <Card className="border-slate-200/80">
            <CardContent className="flex flex-col items-center py-16 text-center">
              <Globe className="h-10 w-10 text-slate-300" />
              <p className="mt-3 font-medium">No custom pages yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">Build promo pages, seasonal offers or service landing pages — they go live at yoursite.com/your-slug.</p>
              <Button className="mt-4 bg-rose-600 hover:bg-rose-700" onClick={openNew}><Plus className="mr-2 h-4 w-4" />Create your first page</Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-slate-200/80 shadow-sm">
            <CardContent className="divide-y divide-slate-100 p-0">
              {pages.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{p.title}</p>
                    <p className="truncate text-xs text-muted-foreground">/{p.slug} · updated {new Date(p.updated_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="outline" className={p.is_published ? 'border-emerald-300 text-emerald-700' : 'border-slate-300 text-slate-500'}>
                      {p.is_published ? 'Live' : 'Draft'}
                    </Badge>
                    {p.is_published === 1 && (
                      <a href={`/${p.slug}`} target="_blank" rel="noreferrer">
                        <Button variant="outline" size="sm"><Eye className="h-3.5 w-3.5" /></Button>
                      </a>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="outline" size="sm" onClick={() => remove(p)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
    </div>
  );
};

export default AdminPages;
