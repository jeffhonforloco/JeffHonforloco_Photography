import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import { installApiFetchBridge } from './lib/api-service'
import './index.css'
import 'react-day-picker/dist/style.css'

installApiFetchBridge()

// A deploy replaces the hashed chunk files; a session started before it can
// reference chunks that no longer exist. Reload once to pick up the new build
// instead of surfacing the error boundary.
window.addEventListener('vite:preloadError', (event) => {
  const lastReload = Number(sessionStorage.getItem('chunk-reload-at') ?? 0);
  if (Date.now() - lastReload > 10_000) {
    event.preventDefault();
    sessionStorage.setItem('chunk-reload-at', String(Date.now()));
    window.location.reload();
  }
});

// Register service worker for offline caching
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .catch((error: unknown) => {
        if (import.meta.env.DEV) {
          console.warn('Service worker registration failed:', error);
        }
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
