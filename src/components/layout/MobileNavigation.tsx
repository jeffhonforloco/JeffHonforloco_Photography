import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import SocialMediaIcons from './SocialMediaIcons';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface MobileNavigationProps {
  isMenuOpen: boolean;
  setIsMenuOpen: (open: boolean) => void;
  onShareClick: () => void;
}

const MobileNavigation = ({ isMenuOpen, setIsMenuOpen, onShareClick }: MobileNavigationProps) => {
  const location = useLocation();
  const focusTrapRef = useFocusTrap(isMenuOpen);

  const navigation = [
    { name: 'Portfolios', href: '/portfolios' },
    { name: 'About', href: '/about' },
    { name: 'Journal', href: '/journal' },
    { name: 'Motion', href: '/portfolios/motion' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path || 
           (path === '/portfolios' && location.pathname.startsWith('/portfolios')) ||
           (path === '/journal' && location.pathname.startsWith('/journal'));
  };

  return (
    <>
      {/* Mobile Header Icons and Menu Button */}
      <div className="md:hidden flex items-center space-x-3">
        <SocialMediaIcons variant="mobile" />
        {/* Mobile menu button */}
        <button
          className="z-50 flex items-center justify-center"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Menu className="w-6 h-6 text-white" />
          )}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        ref={focusTrapRef}
        id="mobile-menu"
        className={`md:hidden absolute top-0 right-0 w-full h-screen bg-black/98 backdrop-blur-md transform transition-all duration-500 ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isMenuOpen}
      >
        <nav className="flex flex-col justify-center items-center h-full space-y-8" aria-label="Mobile navigation">
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
          <button
            onClick={() => {
              onShareClick();
              setIsMenuOpen(false);
            }}
            className="mt-8 p-2 hover:opacity-80 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-photo-red rounded"
            aria-label="Share this page"
          >
            <img
              src="/lovable-uploads/06e1e583-fc89-475d-bf22-b6d815ab75f0.png"
              alt=""
              className="w-6 h-6 filter brightness-0 invert"
              aria-hidden="true"
            />
          </button>

          <SocialMediaIcons variant="mobile-menu" />
        </nav>
      </div>
    </>
  );
};

export default MobileNavigation;