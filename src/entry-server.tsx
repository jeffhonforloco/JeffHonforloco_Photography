import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom/server';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { AppContent } from './App';
import Journal from './pages/Journal';
import type { BlogData } from './types/content';

export const renderHomepage = () => {
  const helmetContext: { helmet?: { script: { toString: () => string } } } = {};
  const body = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location="/">
        <AppContent />
      </StaticRouter>
    </HelmetProvider>,
  );

  return {
    body,
    structuredData: helmetContext.helmet?.script.toString() ?? '',
  };
};

export const renderServiceRoute = (location: string) => {
  const helmetContext: { helmet?: { script: { toString: () => string } } } = {};
  const body = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={location}>
        <AppContent />
      </StaticRouter>
    </HelmetProvider>,
  );

  return {
    body,
    structuredData: helmetContext.helmet?.script.toString() ?? '',
  };
};

export const renderJournal = async () => {
  // Fetch live blog data at build time so the Journal prerenders with the
  // current articles (not stale static data). Falls back to the static JSON
  // if the API is unreachable during build.
  let ssrData: BlogData | null = null;
  const apiBase = process.env.VITE_API_BASE_URL ?? 'https://api-jeffhonforloco-photography.ancient-sun-d712.workers.dev/api/v1';
  try {
    const res = await fetch(`${apiBase}/blog?limit=50`);
    if (res.ok) {
      const d = await res.json();
      ssrData = { posts: d.posts ?? [], categories: d.categories ?? [] };
    }
  } catch {
    // fall through to static JSON
  }
  if (!ssrData) {
    const blogJsonPath = path.join(process.cwd(), 'public', 'data', 'blog-posts.json');
    ssrData = JSON.parse(readFileSync(blogJsonPath, 'utf8')) as BlogData;
  }
  // Map API shape to the public BlogPost shape (same as mapApiPost in Journal.tsx).
  const mapPost = (p: any) => ({
    id: String(p.id ?? p.slug),
    title: p.title,
    excerpt: p.excerpt ?? '',
    content: p.content ?? '',
    category: p.category ?? '',
    image: p.featured_image_url ?? p.image ?? '',
    galleryImages: p.gallery_images ?? p.galleryImages ?? [],
    date: p.published_at ?? p.created_at ?? p.date ?? '',
    readTime: p.read_time ?? p.readTime ?? '',
    slug: p.slug ?? p.id,
  });
  const apiPosts = (ssrData.posts ?? []).map(mapPost);

  // Merge with static JSON so older articles aren't lost (API wins on slug conflicts).
  const blogJsonPath = path.join(process.cwd(), 'public', 'data', 'blog-posts.json');
  let staticPosts: any[] = [];
  let staticCategories: string[] = [];
  try {
    const staticData = JSON.parse(readFileSync(blogJsonPath, 'utf8'));
    staticPosts = (staticData.posts ?? []).map(mapPost);
    staticCategories = staticData.categories ?? [];
  } catch {
    // static JSON unreadable — API posts alone are fine
  }
  const seen = new Set(apiPosts.map((p: { slug: string }) => p.slug));
  const mergedPosts = [...apiPosts, ...staticPosts.filter((p: { slug: string }) => !seen.has(p.slug))];
  const mergedCategories = [...new Set([...(ssrData.categories ?? []), ...staticCategories])];

  const mapped: BlogData = { categories: mergedCategories, posts: mergedPosts };
  (globalThis as { __JOURNAL_SSR_DATA__?: BlogData }).__JOURNAL_SSR_DATA__ = mapped;

  try {
    const helmetContext: { helmet?: { script: { toString: () => string } } } = {};
    const body = renderToString(
      <HelmetProvider context={helmetContext}>
        <StaticRouter location="/journal">
          <Journal />
        </StaticRouter>
      </HelmetProvider>,
    );

    return {
      body,
      structuredData: helmetContext.helmet?.script.toString() ?? '',
    };
  } finally {
    delete (globalThis as { __JOURNAL_SSR_DATA__?: BlogData }).__JOURNAL_SSR_DATA__;
  }
};
