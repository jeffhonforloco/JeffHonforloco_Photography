
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Journal', href: '/journal' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/portfolio' && location.pathname.startsWith('/portfolio')) ||
           (path === '/journal' && location.pathname.startsWith('/journal'));
  };

  return (
    <div className="min-h-screen bg-photo-black text-photo-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-photo-black/90 backdrop-blur-sm border-b border-gray-800">
        <div className="section-padding">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="text-xl font-bold hover:text-photo-red transition-colors">
              JEFF HONFORLOCO
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`font-medium transition-colors hover:text-photo-red ${
                    isActive(item.href) ? 'text-photo-red' : 'text-photo-white'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <span className={`block h-0.5 w-6 bg-white transform transition ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`block h-0.5 w-6 bg-white transition ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-0.5 w-6 bg-white transform transition ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
              </div>
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-800">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block py-2 font-medium transition-colors hover:text-photo-red ${
                    isActive(item.href) ? 'text-photo-red' : 'text-photo-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12 mt-20">
        <div className="section-padding">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Jeff Honforloco Photography</h3>
              <p className="text-gray-400">
                Professional portrait, fashion, and editorial photography with a focus on 
                capturing authentic moments and stunning visual narratives.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block text-gray-400 hover:text-photo-red transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="space-y-2">
                <a href="https://instagram.com/jeffhonforloco" target="_blank" rel="noopener noreferrer" 
                   className="block text-gray-400 hover:text-photo-red transition-colors">
                  Instagram
                </a>
                <a href="https://youtube.com/@jeffhonforloco" target="_blank" rel="noopener noreferrer" 
                   className="block text-gray-400 hover:text-photo-red transition-colors">
                  YouTube
                </a>
                <Link to="/contact" className="block text-gray-400 hover:text-photo-red transition-colors">
                  Book a Session
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Jeff Honforloco Photography. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
