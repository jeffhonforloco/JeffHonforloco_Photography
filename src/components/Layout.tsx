
import { useLocation } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-photo-black text-photo-white">
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:bg-photo-red focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      <Header />

      <main id="main-content" tabIndex={-1}>
        {children}
      </main>

      {location.pathname !== '/' && location.pathname !== '/about' && !location.pathname.startsWith('/portfolio') && location.pathname !== '/contact' && <Footer />}
    </div>
  );
};

export default Layout;
