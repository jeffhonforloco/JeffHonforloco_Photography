import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { apiUrl } from '@/lib/api-base';
import { optimizeImageForUpload } from '@/lib/image-optimize';
import {
  Plus, RefreshCw, Images, Link2, Copy, Trash2, Upload,
  Heart, ArrowLeft, CircleCheck, AlertCircle, Eye, Lock,
} from 'lucide-react';

/* ------------------------------------------------------------------ */

interface Gallery {
  id: number; slug: string; title: string;
  client_name: string | null; client_email: string | null;
  has_password: boolean; expires_at: string | null; is_active: number;
  photo_count: number; selection_count: number;
  share_url: string; created_at: string;
}

interface GalleryPhoto { id: number; r2_key: string; title: string | null; url: string; thumbnail_url?: string; sort_order: number }
interface Selection {
  id: number; photo_id: number; client_name: string | null; client_email: string | null;
  note: string | null; created_at: string; photo_url: string; photo_title: string | null;
}

const authHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

/* ------------------------------------------------------------------ */

const AdminGalleries: React.FC = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', client_name: '', client_email: '', password: '', expires_at: '' });

  const [selected, setSelected] = useState<Gallery | null>(null);
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const [selections, setSelections] = useState<Selection[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(null), 4000); };

  /* ---- list ---- */
  const fetchGalleries = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await fetch(apiUrl('/api/v1/admin/galleries'), { headers: authHeaders() });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.error || 'Failed to load galleries');
      setGalleries(d.data.galleries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load galleries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchGalleries(); }, [fetchGalleries]);

  /* ---- detail ---- */
  const openGallery = async (g: Gallery) => {
    setSelected(g); setDetailLoading(true); setError(null);
    setPhotos([]); setSelections([]); // don't show the previous gallery's photos on a failed load
    try {
      const [pRes, sRes] = await Promise.all([
        fetch(apiUrl(`/api/v1/admin/galleries/${g.id}`), { headers: authHeaders() }),
        fetch(apiUrl(`/api/v1/admin/galleries/${g.id}/selections`), { headers: authHeaders() }),
      ]);
      const p = await pRes.json(); const s = await sRes.json();
      if (pRes.ok && p.success) setPhotos(p.data.photos);
      if (sRes.ok && s.success) setSelections(s.data.selections);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gallery');
    } finally {
      setDetailLoading(false);
    }
  };

  const refreshSelections = async () => {
    if (!selected) return;
    const res = await fetch(apiUrl(`/api/v1/admin/galleries/${selected.id}/selections`), { headers: authHeaders() });
    const d = await res.json();
    if (res.ok && d.success) setSelections(d.data.selections);
  };

  /* ---- create ---- */
  const createGallery = async () => {
    if (!form.title.trim()) { setError('Give the gallery a title'); return; }
    try {
      setCreating(true); setError(null);
      const res = await fetch(apiUrl('/api/v1/admin/galleries'), {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          title: form.title.trim(),
          client_name: form.client_name.trim() || undefined,
          client_email: form.client_email.trim() || undefined,
          password: form.password || undefined,
          expires_at: form.expires_at || undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.error || 'Failed to create gallery');
      setCreateOpen(false);
      setForm({ title: '', client_name: '', client_email: '', password: '', expires_at: '' });
      flash(`Gallery created — share link: ${window.location.origin}/proof/${d.data.slug}`);
      void fetchGalleries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create gallery');
    } finally {
      setCreating(false);
    }
  };

  /* ---- delete ---- */
  const deleteGallery = async (g: Gallery) => {
    if (!confirm(`Delete "${g.title}" and all its photos? This cannot be undone.`)) return;
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/galleries/${g.id}`), { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) throw new Error('Delete failed');
      if (selected?.id === g.id) setSelected(null);
      flash('Gallery deleted');
      void fetchGalleries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  /* ---- photo upload (WebP-optimized in browser first) ---- */
  const uploadFiles = async (files: FileList | File[]) => {
    if (!selected) return;
    const list = Array.from(files).filter((f) => f.type.startsWith('image/')).slice(0, 20);
    if (!list.length) { setError('Please choose image files'); return; }
    try {
      setUploading(true); setError(null);
      const token = localStorage.getItem('adminToken');
      const fd = new FormData();
      // Convert each photo to WebP (2048px) + thumbnail (400px) before upload.
      // `images` and `thumbnails` are paired by index server-side.
      for (const f of list) {
        // eslint-disable-next-line no-await-in-loop
        const { full, thumb } = await optimizeImageForUpload(f);
        fd.append('images', full.blob, full.name);
        fd.append('thumbnails', thumb.blob, thumb.name);
      }
      const res = await fetch(apiUrl(`/api/v1/admin/galleries/${selected.id}/photos`), {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
      });
      const d = await res.json();
      if (!res.ok || !d.success) throw new Error(d.error || 'Upload failed');
      flash(`${d.data.count} photo${d.data.count > 1 ? 's' : ''} added`);
      void openGallery(selected);
      void fetchGalleries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId: number) => {
    if (!selected || !confirm('Delete this photo?')) return;
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/galleries/${selected.id}/photos/${photoId}`), {
        method: 'DELETE', headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Delete failed');
      setPhotos((p) => p.filter((x) => x.id !== photoId));
      void fetchGalleries();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const copyShareLink = (g: Gallery) => {
    void navigator.clipboard?.writeText(`${window.location.origin}${g.share_url}`).catch(() => {});
    flash('Share link copied');
  };

  /* ================= render ================= */

  if (selected) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
              <ArrowLeft className="mr-2 h-4 w-4" />All galleries
            </Button>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight">{selected.title}</h1>
              <p className="text-sm text-muted-foreground">
                {selected.client_name || 'No client name'} · {photos.length} photos · {selections.length} selections
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => copyShareLink(selected)}>
              <Copy className="mr-2 h-4 w-4" />Copy share link
            </Button>
            <Button variant="outline" size="sm" onClick={refreshSelections}>
              <RefreshCw className="mr-2 h-4 w-4" />Refresh picks
            </Button>
          </div>
        </div>

        {error && <div className="flex items-start gap-2 rounded-lg border border-[#c8102e]/40 bg-[#c8102e]/10 px-4 py-3 text-sm text-[#f2a3b1]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
        {success && <div className="flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CircleCheck className="mt-0.5 h-4 w-4 shrink-0" />{success}</div>}

        {/* Upload */}
        <Card className="border-[#c8102e]/30">
          <CardContent className="pt-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); void uploadFiles(e.dataTransfer.files); }}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${dragOver ? 'border-[#c8102e] bg-[#c8102e]/10' : 'border-neutral-800 bg-neutral-900/60'}`}
            >
              {uploading ? <><RefreshCw className="h-7 w-7 animate-spin text-[#c8102e]" /><p className="mt-2 text-sm font-medium">Uploading...</p></>
                : <><Upload className="h-7 w-7 text-neutral-500" /><p className="mt-2 text-sm font-medium">Drag & drop shoot photos here</p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => fileRef.current?.click()}><Plus className="mr-2 h-4 w-4" />Browse</Button></>}
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={(e) => { if (e.target.files) void uploadFiles(e.target.files); e.target.value = ''; }} />
            </div>
          </CardContent>
        </Card>

        {/* Photos */}
        <Card className="border-neutral-800 shadow-sm">
          <CardHeader><CardTitle className="text-[15px]">Photos ({photos.length})</CardTitle></CardHeader>
          <CardContent>
            {detailLoading ? <p className="text-sm text-muted-foreground">Loading...</p>
              : photos.length === 0 ? <p className="text-sm text-muted-foreground">No photos yet — upload the shoot above.</p>
              : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {photos.map((p) => (
                  <div key={p.id} className="group relative overflow-hidden rounded-lg border border-neutral-800">
                    <img src={p.thumbnail_url || p.url} alt={p.title || ''} className="aspect-square w-full object-cover" loading="lazy" />
                    <button onClick={() => deletePhoto(p.id)}
                      className="absolute right-2 top-2 rounded-md bg-slate-950/70 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100" aria-label="Delete photo">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>}
          </CardContent>
        </Card>

        {/* Client selections */}
        <Card className="border-neutral-800 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <Heart className="h-4 w-4 text-[#c8102e]" />Client Picks ({selections.length})
            </CardTitle>
            <CardDescription>Photos your client marked as favorites</CardDescription>
          </CardHeader>
          <CardContent>
            {selections.length === 0
              ? <p className="text-sm text-muted-foreground">No picks yet — they'll appear here when your client selects favorites.</p>
              : <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {selections.map((s) => (
                  <div key={s.id} className="overflow-hidden rounded-lg border border-neutral-800">
                    <img src={s.photo_url} alt={s.photo_title || ''} className="aspect-square w-full object-cover" loading="lazy" />
                    <div className="p-2">
                      <p className="truncate text-xs font-medium">{s.client_name || s.client_email || 'Client'}</p>
                      {s.note && <p className="truncate text-[11px] text-muted-foreground">"{s.note}"</p>}
                      <p className="text-[10px] text-muted-foreground">{new Date(s.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>}
          </CardContent>
        </Card>
      </div>
    );
  }

  /* ---- list view ---- */
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight">Client Galleries</h1>
          <p className="text-sm text-muted-foreground">Private proofing galleries — share the link, see what clients pick</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchGalleries} variant="outline" size="sm"><RefreshCw className="mr-2 h-4 w-4" />Refresh</Button>
          <Button onClick={() => setCreateOpen(true)} size="sm" className="bg-[#c8102e] hover:bg-[#a50d26]">
            <Plus className="mr-2 h-4 w-4" />New Gallery
          </Button>
        </div>
      </div>

      {error && <div className="flex items-start gap-2 rounded-lg border border-[#c8102e]/40 bg-[#c8102e]/10 px-4 py-3 text-sm text-[#f2a3b1]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
      {success && <div className="flex items-start gap-2 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><CircleCheck className="mt-0.5 h-4 w-4 shrink-0" />{success}</div>}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading galleries...</p>
      ) : galleries.length === 0 ? (
        <Card className="border-neutral-800">
          <CardContent className="flex flex-col items-center py-16 text-center">
            <Images className="h-10 w-10 text-slate-300" />
            <p className="mt-3 font-medium">No galleries yet</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Create a private gallery for a client's shoot, upload the photos, and send them the link to pick favorites.</p>
            <Button className="mt-4 bg-[#c8102e] hover:bg-[#a50d26]" onClick={() => setCreateOpen(true)}><Plus className="mr-2 h-4 w-4" />Create your first gallery</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {galleries.map((g) => (
            <Card key={g.id} className="border-neutral-800 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{g.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{g.client_name || g.client_email || 'No client assigned'}</p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {g.has_password && <Badge variant="outline" className="text-[10px]"><Lock className="mr-1 h-3 w-3" />Locked</Badge>}
                    {g.is_active === 0 && <Badge variant="destructive" className="text-[10px]">Off</Badge>}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><Images className="h-3.5 w-3.5" />{g.photo_count}</span>
                  <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{g.selection_count} picks</span>
                </div>
                <div className="mt-3 flex items-center gap-1 rounded-lg bg-neutral-900 px-2 py-1.5 text-[11px] text-muted-foreground">
                  <Link2 className="h-3 w-3 shrink-0" />
                  <span className="truncate">{window.location.origin}{g.share_url}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => openGallery(g)}>
                    <Eye className="mr-2 h-3.5 w-3.5" />Open
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyShareLink(g)}><Copy className="h-3.5 w-3.5" /></Button>
                  <Button variant="outline" size="sm" onClick={() => deleteGallery(g)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Client Gallery</DialogTitle>
            <DialogDescription>A private proofing page for one shoot. You'll get a shareable link.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && <div className="flex items-start gap-2 rounded-lg border border-[#c8102e]/40 bg-[#c8102e]/10 px-4 py-3 text-sm text-[#f2a3b1]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
            <div><Label>Shoot title *</Label><Input className="mt-1.5" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Smith Wedding — Previews" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Client name</Label><Input className="mt-1.5" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="Jane Smith" /></div>
              <div><Label>Client email</Label><Input className="mt-1.5" value={form.client_email} onChange={(e) => setForm({ ...form, client_email: e.target.value })} placeholder="jane@email.com" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Password <span className="text-muted-foreground">(optional)</span></Label><Input className="mt-1.5" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Leave empty for open link" /></div>
              <div><Label>Expires <span className="text-muted-foreground">(optional)</span></Label><Input className="mt-1.5" type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button onClick={createGallery} disabled={creating} className="bg-[#c8102e] hover:bg-[#a50d26]">
                {creating ? 'Creating...' : 'Create Gallery'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGalleries;
