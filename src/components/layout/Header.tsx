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
      <div className="max-w-8xl mx-auto pl-8 md:pl-16 pr-2 md:pr-4">
        <div className="flex justify-between items-start">
          {/* Left side - Logo or empty space */}
          <div className="flex items-center">
            {/* Logo - Only show on non-homepage and desktop */}
            {location.pathname !== '/' && (
              <Link to="/" className="hidden md:flex items-center space-x-2 hover:opacity-80 transition-opacity duration-300">
                <img 
                  src="/lovable-uploads/f17266df-16a1-4edd-8581-23b10bdb2eda.png" 
                  alt="J Logo" 
                  className="h-16 md:h-20 w-auto object-contain"
                />
              </Link>
            )}
            {/* Empty div for spacing on mobile */}
            <div className="md:hidden"></div>
          </div>

          {/* Desktop Navigation - Centered */}
          <DesktopNavigation
            isPortfolioDropdownOpen={isPortfolioDropdownOpen}
            setIsPortfolioDropdownOpen={setIsPortfolioDropdownOpen}
            onShareClick={handleShareClick}
          />

          {/* Right side - Social Media Icons */}
          <div className="flex items-center">
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