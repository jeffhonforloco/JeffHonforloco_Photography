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
    <div className="hidden md:flex space-x-8 absolute left-1/2 transform -translate-x-1/2 items-center">
      {/* Portfolios with Dropdown */}
      <div className="relative group">
        <Link
          to="/portfolios"
          className={`luxury-nav-link-thin font-black text-white brightness-150 hover:text-white text-sm font-extrabold ${
            isActive('/portfolios') ? 'text-white' : 'text-white'
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
          className={`luxury-nav-link-thin font-black text-white brightness-150 hover:text-white text-sm font-extrabold ${
            isActive(item.href) ? 'text-white' : 'text-white'
          }`}
          style={{ textShadow: '0 0 1px currentColor' }}
        >
          {item.name}
        </Link>
      ))}
      
      <div className="ml-2">
        <svg 
          className="w-5 h-5 text-white hover:opacity-80 transition-all duration-300 cursor-pointer" 
          onClick={onShareClick}
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92S19.61 16.08 18 16.08z"/>
        </svg>
      </div>
    </div>
  );
};

export default DesktopNavigation;
