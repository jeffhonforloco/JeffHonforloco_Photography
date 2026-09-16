import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Heart, Download, Lock, Check } from 'lucide-react';

interface ProofPhoto { id: number; title: string | null; url: string; thumbnail_url: string | null }

const API_BASE: string =
  ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '').replace(/\/$/, '');

const ProofGallery: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [title, setTitle] = useState('');
  const [photos, setPhotos] = useState<ProofPhoto[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [showIdForm, setShowIdForm] = useState(false);

  const load = useCallback(async (pw?: string) => {
    if (!slug) return;
    try {
      setLoading(true); setError(null);
      const qs = pw ? `?password=${encodeURIComponent(pw)}` : '';
      const res = await fetch(`${API_BASE}/api/v1/proof/${slug}${qs}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Gallery not found');
      if (d.data.passwordRequired) {
        setPasswordRequired(true);
        setTitle(d.data.title || 'Private Gallery');
        return;
      }
      setTitle(d.data.title);
      setPhotos(d.data.photos);
      setSelected(new Set(d.data.selected_photo_ids || []));
      setPasswordRequired(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load gallery');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { void load(); }, [load]);

  const unlock = async () => {
    setUnlocking(true);
    await load(password);
    setUnlocking(false);
  };

  const toggleSelect = async (photoId: number) => {
    const isSelected = selected.has(photoId);
    // Optimistic update
    const next = new Set(selected);
    if (isSelected) next.delete(photoId); else next.add(photoId);
    setSelected(next);

    try {
      if (isSelected) {
        const qs = password ? `?password=${encodeURIComponent(password)}` : '';
        await fetch(`${API_BASE}/api/v1/proof/${slug}/select/${photoId}${qs}`, { method: 'DELETE' });
      } else {
        await fetch(`${API_BASE}/api/v1/proof/${slug}/select`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            photo_id: photoId,
            client_name: clientName || undefined,
            client_email: clientEmail || undefined,
            password: password || undefined,
          }),
        });
      }
    } catch {
      // Revert on failure
      setSelected(selected);
    }
  };

  const downloadPhoto = (url: string, name: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = name || 'photo.webp';
    a.target = '_blank';
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSelected = () => {
    photos.filter((p) => selected.has(p.id)).forEach((p, i) => {
      setTimeout(() => downloadPhoto(p.url, `${slug}-${p.id}.webp`), i * 600);
    });
  };

  /* ---------- states ---------- */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-rose-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center text-white">
        <p className="text-xl font-semibold">This gallery isn't available</p>
        <p className="mt-2 text-sm text-white/60">{error}</p>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-white">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur">
          <Lock className="mx-auto h-8 w-8 text-rose-500" />
          <h1 className="mt-4 text-xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-white/60">This gallery is password protected</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void unlock()}
            placeholder="Enter gallery password"
            className="mt-6 w-full rounded-lg border border-white/15 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-rose-500 focus:outline-none"
          />
          <button
            onClick={() => void unlock()}
            disabled={unlocking || !password}
            className="mt-3 w-full rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:opacity-50"
          >
            {unlocking ? 'Unlocking...' : 'View Gallery'}
          </button>
        </div>
      </div>
    );
  }

  /* ---------- gallery ---------- */
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-rose-500">Jeff Honforloco Photography</p>
            <h1 className="mt-1 text-xl font-bold">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowIdForm(!showIdForm)}
              className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/80 hover:bg-white/5"
            >
              {clientName || 'Add your name'}
            </button>
            {selected.size > 0 && (
              <button
                onClick={downloadSelected}
                className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold hover:bg-rose-500"
              >
                <Download className="h-3.5 w-3.5" />Download {selected.size} favorite{selected.size > 1 ? 's' : ''}
              </button>
            )}
          </div>
        </div>
        {showIdForm && (
          <div className="border-t border-white/10 px-4 py-3 sm:px-6">
            <div className="mx-auto flex max-w-7xl flex-wrap gap-2">
              <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Your name"
                className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-rose-500 focus:outline-none" />
              <input value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="Your email (optional)"
                className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-rose-500 focus:outline-none" />
              <span className="self-center text-[11px] text-white/50">So Jeff knows whose picks these are</span>
            </div>
          </div>
        )}
      </header>

      {/* Instructions */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <p className="text-sm text-white/60">
          Tap the <Heart className="inline h-3.5 w-3.5 text-rose-500" /> on any photo to mark it as a favorite.
          {selected.size > 0 && <> <span className="font-semibold text-white">{selected.size} selected</span> so far.</>}
        </p>
      </div>

      {/* Grid */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p) => {
            const isSel = selected.has(p.id);
            return (
              <div key={p.id} className={`group relative overflow-hidden rounded-xl border transition ${isSel ? 'border-rose-500 ring-2 ring-rose-500/40' : 'border-white/10'}`}>
                <img src={p.thumbnail_url || p.url} alt={p.title || ''} loading="lazy" className="aspect-[4/5] w-full object-cover" />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2">
                  <button
                    onClick={() => void toggleSelect(p.id)}
                    aria-label={isSel ? 'Remove favorite' : 'Mark favorite'}
                    className={`rounded-full p-2.5 backdrop-blur transition ${isSel ? 'bg-rose-600 text-white' : 'bg-black/50 text-white/80 hover:bg-black/70 hover:text-white'}`}
                  >
                    {isSel ? <Check className="h-4 w-4" /> : <Heart className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => downloadPhoto(p.url, `${slug}-${p.id}.webp`)}
                    aria-label="Download photo"
                    className="rounded-full bg-black/50 p-2.5 text-white/80 backdrop-blur transition hover:bg-black/70 hover:text-white"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                </div>
                {isSel && (
                  <div className="absolute bottom-2 left-2 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                    Favorite
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {photos.length === 0 && (
          <p className="py-20 text-center text-sm text-white/50">Photos are being added — check back soon.</p>
        )}
      </main>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-white/40">
        © Jeff Honforloco Photography · {title}
      </footer>
    </div>
  );
};

export default ProofGallery;
