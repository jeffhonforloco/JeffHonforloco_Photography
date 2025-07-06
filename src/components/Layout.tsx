
import { useLocation } from 'react-router-dom';
import Header from './layout/Header';
import Footer from './layout/Footer';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen bg-photo-black text-photo-white">
      <Header />
      <main>
        {children}
      </main>
      {location.pathname !== '/' && location.pathname !== '/about' && location.pathname !== '/portfolio' && location.pathname !== '/portfolio/motion' && <Footer />}
    </div>
  );
};

export default Layout;
