import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom/server';
import { AppContent } from './App';

export const renderHomepage = () => renderToString(
  <HelmetProvider>
    <StaticRouter location="/">
      <AppContent />
    </StaticRouter>
  </HelmetProvider>,
);

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
