import { Link, useLocation } from 'react-router-dom';
import PortfolioDropdown from './PortfolioDropdown';

interface DesktopNavigationProps {
  isPortfolioDropdownOpen: boolean;
  setIsPortfolioDropdownOpen: (open: boolean) => void;
  onShareClick: () => void;
}

const DesktopNavigation = ({ 
  isPortfolioDropdownOpen, 
  setIsPortfolioDropdownOpen, 
  onShareClick 
}: DesktopNavigationProps) => {
  const location = useLocation();

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
    <div className="hidden md:flex space-x-8 absolute left-1/2 transform -translate-x-1/2 items-center">
      {/* Portfolios with Dropdown */}
      <div className="relative group">
        <Link
          to="/portfolio"
          className={`luxury-nav-link-thin font-black text-white brightness-150 hover:text-white text-lg font-extrabold ${
            isActive('/portfolio') ? 'text-white' : 'text-white'
          }`}
          onMouseEnter={() => setIsPortfolioDropdownOpen(true)}
          style={{ textShadow: '0 0 1px currentColor' }}
        >
          Portfolios
        </Link>
        
        <PortfolioDropdown
          isOpen={isPortfolioDropdownOpen}
          onMouseEnter={() => setIsPortfolioDropdownOpen(true)}
          onMouseLeave={() => setIsPortfolioDropdownOpen(false)}
          onClose={() => setIsPortfolioDropdownOpen(false)}
        />
      </div>
      
      {/* Other Navigation Items */}
      {navigation.slice(1).map((item) => (
        <Link
          key={item.name}
          to={item.href}
          className={`luxury-nav-link-thin font-black text-white brightness-150 hover:text-white text-lg font-extrabold ${
            isActive(item.href) ? 'text-white' : 'text-white'
          }`}
          style={{ textShadow: '0 0 1px currentColor' }}
        >
          {item.name}
        </Link>
      ))}
      
      <img 
        src="/lovable-uploads/06e1e583-fc89-475d-bf22-b6d815ab75f0.png" 
        alt="Share" 
        className="w-12 h-12 filter invert hover:opacity-80 transition-all duration-300 cursor-pointer" 
        onClick={onShareClick}
      />
    </div>
  );
};

export default DesktopNavigation;
