import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ShareModal from '../ShareModal';
import DesktopNavigation from './DesktopNavigation';
import MobileNavigation from './MobileNavigation';
import SocialMediaIcons from './SocialMediaIcons';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isPortfolioDropdownOpen, setIsPortfolioDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled ? 'bg-black/95 backdrop-blur-md py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-8xl mx-auto px-4 md:px-8 lg:px-16">
        <div className="flex justify-between items-center">
          {/* Left side - Logo or empty space */}
          <div className="flex items-center min-w-0 flex-1 md:flex-initial">
            {/* Logo - Only show on non-homepage */}
            {location.pathname !== '/' && (
              <Link to="/" className="flex items-center hover:opacity-80 transition-opacity duration-300">
                <img 
                  src="/lovable-uploads/f17266df-16a1-4edd-8581-23b10bdb2eda.png" 
                  alt="J Logo" 
                  className="h-12 sm:h-14 md:h-12 lg:h-14 w-auto object-contain"
                />
              </Link>
            )}
          </div>

          {/* Desktop Navigation - Centered */}
          <DesktopNavigation
            isPortfolioDropdownOpen={isPortfolioDropdownOpen}
            setIsPortfolioDropdownOpen={setIsPortfolioDropdownOpen}
            onShareClick={handleShareClick}
          />

          {/* Right side - Social Media Icons and Mobile Menu */}
          <div className="flex items-center justify-end min-w-0 flex-1 md:flex-initial md:absolute md:right-4 lg:right-8 xl:right-16">
            {/* Desktop Social Media Icons */}
            <SocialMediaIcons variant="desktop" />

            {/* Mobile Navigation */}
            <MobileNavigation
              isMenuOpen={isMenuOpen}
              setIsMenuOpen={setIsMenuOpen}
              onShareClick={handleShareClick}
            />
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