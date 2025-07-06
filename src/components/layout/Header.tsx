
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Menu, X, Facebook, Instagram, Youtube } from 'lucide-react';
import ShareModal from '../ShareModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
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
    { name: 'Motion', href: '/portfolio/motion' },
    { name: 'Contact', href: '/contact' },
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
      <div className="max-w-8xl mx-auto pl-8 md:pl-16 pr-1 md:pr-2">
        <div className="flex justify-between items-start">
          {/* Left side - Logo or empty space */}
          <div className="flex items-center">
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
            {/* Empty div for spacing on mobile */}
            <div className="md:hidden"></div>
          </div>

          {/* Desktop Navigation - Centered */}
          <div className="hidden md:flex space-x-12 absolute left-1/2 transform -translate-x-1/2 items-center">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`luxury-nav-link-thin font-extrabold ${
                  isActive(item.href) ? 'text-white' : 'text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <img 
              src="/lovable-uploads/06e1e583-fc89-475d-bf22-b6d815ab75f0.png" 
              alt="Share" 
              className="w-6 h-6 filter brightness-0 invert hover:opacity-80 transition-all duration-300 cursor-pointer ml-2" 
              onClick={() => setIsShareModalOpen(true)}
            />
          </div>

          {/* Right side - Social Media Icons */}
          <div className="flex items-center">
            {/* Desktop Social Media Icons */}
            <div className="hidden md:flex items-center space-x-3">
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-300">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-300">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors duration-300">
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            {/* Mobile Right Side - Social Media Icons then Menu */}
            <div className="md:hidden flex items-center space-x-2 mt-2">
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
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden absolute top-0 right-0 w-full h-screen bg-black/98 backdrop-blur-md transform transition-all duration-500 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex flex-col justify-center items-center h-full space-y-8">
            {navigation.map((item, index) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-2xl md:text-3xl font-bold tracking-wider transition-all duration-300 hover:text-white transform ${
                  isActive(item.href) ? 'text-white' : 'text-white'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <img 
              src="/lovable-uploads/06e1e583-fc89-475d-bf22-b6d815ab75f0.png" 
              alt="Share" 
              className="w-6 h-6 filter brightness-0 invert hover:opacity-80 transition-all duration-300 cursor-pointer mt-8" 
              onClick={() => setIsShareModalOpen(true)}
            />
            
            {/* Share Button */}
            <div className="mt-8 flex items-center space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300">
                <Youtube className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
      
      {/* Share Modal */}
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
      />
    </nav>
  );
};

export default Header;
