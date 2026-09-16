import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

type Block =
  | { type: 'hero'; heading: string; subheading?: string; imageUrl?: string; ctaText?: string; ctaUrl?: string }
  | { type: 'text'; heading?: string; body: string }
  | { type: 'image'; imageUrl: string; caption?: string }
  | { type: 'gallery'; imageUrls: string[] }
  | { type: 'cta'; heading: string; text?: string; buttonText: string; buttonUrl: string };

interface PageData {
  slug: string; title: string; meta_description: string | null;
  content: Block[]; updated_at: string;
}

const API_BASE: string =
  ((import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '').replace(/\/$/, '');

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case 'hero':
      return (
        <section className="relative flex min-h-[60vh] items-center justify-center overflow-hidden bg-black text-white">
          {block.imageUrl && (
            <>
              <img src={block.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40" />
            </>
          )}
          <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">{block.heading}</h1>
            {block.subheading && <p className="mx-auto mt-4 max-w-2xl text-lg text-white/80">{block.subheading}</p>}
            {block.ctaText && block.ctaUrl && (
              <Link to={block.ctaUrl}
                className="mt-8 inline-block rounded-full bg-rose-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-500">
                {block.ctaText}
              </Link>
            )}
          </div>
        </section>
      );
    case 'text':
      return (
        <section className="mx-auto max-w-3xl px-6 py-12">
          {block.heading && <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{block.heading}</h2>}
          <div className="prose prose-slate mt-4 max-w-none">
            {block.body.split(/\n\s*\n/).map((para, i) => (
              <p key={i} className="mb-4 leading-relaxed text-slate-700">{para}</p>
            ))}
          </div>
        </section>
      );
    case 'image':
      return (
        <section className="mx-auto max-w-5xl px-6 py-8">
          <img src={block.imageUrl} alt={block.caption || ''} className="w-full rounded-2xl object-cover shadow-lg" loading="lazy" />
          {block.caption && <p className="mt-2 text-center text-sm text-slate-500">{block.caption}</p>}
        </section>
      );
    case 'gallery':
      return (
        <section className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {block.imageUrls.map((url, i) => (
              <img key={i} src={url} alt="" loading="lazy" className="aspect-square w-full rounded-xl object-cover" />
            ))}
          </div>
        </section>
      );
    case 'cta':
      return (
        <section className="bg-slate-950 py-16 text-white">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight">{block.heading}</h2>
            {block.text && <p className="mt-3 text-white/70">{block.text}</p>}
            <Link to={block.buttonUrl}
              className="mt-6 inline-block rounded-full bg-rose-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-rose-500">
              {block.buttonText}
            </Link>
          </div>
        </section>
      );
    default:
      return null;
  }
}

const DynamicPage: React.FC<{ fallback?: React.ReactNode }> = ({ fallback }) => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true); setNotFound(false);
    fetch(`${API_BASE}/api/v1/pages/${encodeURIComponent(slug)}`)
      .then((r) => {
        if (!r.ok) throw new Error('not found');
        return r.json();
      })
      .then((d) => {
        if (d.success) setPage(d.data);
        else throw new Error('not found');
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black" role="status" aria-label="Loading page">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-rose-600" />
      </div>
    );
  }

  if (notFound || !page) {
    return <>{fallback ?? null}</>;
  }

  return (
    <>
      <Helmet>
        <title>{page.title} | Jeff Honforloco Photography</title>
        {page.meta_description && <meta name="description" content={page.meta_description} />}
        <meta property="og:title" content={page.title} />
        {page.meta_description && <meta property="og:description" content={page.meta_description} />}
      </Helmet>
      <article>
        {page.content.map((block, i) => <BlockView key={i} block={block} />)}
      </article>
    </>
  );
};

export default DynamicPage;
