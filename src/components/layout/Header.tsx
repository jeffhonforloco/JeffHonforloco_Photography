
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Facebook, Instagram, Youtube } from 'lucide-react';

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
        <div className="flex justify-between items-start">
          {/* Mobile Left Side - Social Media Icons then Menu - Positioned at top */}
          <div className="md:hidden flex items-center space-x-3 mt-2">
            <a href="#" className="text-white/70 hover:text-white transition-colors">
              <Facebook className="w-4 h-4" />
            </a>
            <a href="#" className="text-white/70 hover:text-white transition-colors">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="text-white/70 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
            <a href="#" className="text-white/70 hover:text-white transition-colors">
              <Youtube className="w-4 h-4" />
            </a>
            {/* Mobile menu button */}
            <button
              className="z-50 ml-3"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>

          {/* Logo - Only show on non-homepage and desktop */}
          {location.pathname !== '/' && (
            <Link to="/" className="hidden md:flex items-center space-x-2 hover:opacity-80 transition-opacity duration-300">
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

          {/* Empty div for spacing on mobile */}
          <div className="md:hidden"></div>
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
