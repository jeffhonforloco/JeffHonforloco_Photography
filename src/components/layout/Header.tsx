
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Portfolios', href: '/portfolio' },
    { name: 'About', href: '/about' },
    { name: 'Journal', href: '/journal' },
    { name: 'Contact', href: '/contact' },
    { name: 'Book a Session', href: '/contact?session=true' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/portfolio' && location.pathname.startsWith('/portfolio')) ||
           (path === '/journal' && location.pathname.startsWith('/journal'));
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled ? 'bg-black/95 backdrop-blur-md py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-8xl mx-auto px-8 md:px-16">
        <div className="flex justify-between items-center">
          {/* Logo - Only show on non-homepage */}
          {location.pathname !== '/' && (
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-300">
              <img 
                src="/lovable-uploads/f17266df-16a1-4edd-8581-23b10bdb2eda.png" 
                alt="J Logo" 
                className="w-8 h-8 md:w-10 md:h-10"
              />
            </Link>
          )}

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex space-x-12 absolute left-1/2 transform -translate-x-1/2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`luxury-nav-link-thin ${
                  isActive(item.href) ? 'text-white' : 'text-white/70'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden z-50"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-7 h-7 text-white" />
            ) : (
              <Menu className="w-7 h-7 text-white" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden absolute top-0 left-0 w-full h-screen bg-black/98 backdrop-blur-md transform transition-all duration-500 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col justify-center items-center h-full space-y-8">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-2xl md:text-3xl font-light tracking-wider transition-all duration-300 hover:text-white transform ${
                  isActive(item.href) ? 'text-white' : 'text-white/70'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Header;
