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

export const renderJournal = () => {
  // Load the static blog data at build time so the Journal prerenders
  // with articles visible immediately (no API waterfall on first load).
  // Journal is lazy-loaded in App, so we use a direct static import for SSR
  // (renderToString can't resolve lazy components).
  const blogJsonPath = path.join(process.cwd(), 'public', 'data', 'blog-posts.json');
  const ssrData = JSON.parse(readFileSync(blogJsonPath, 'utf8')) as BlogData;
  (globalThis as { __JOURNAL_SSR_DATA__?: BlogData }).__JOURNAL_SSR_DATA__ = ssrData;

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
