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
