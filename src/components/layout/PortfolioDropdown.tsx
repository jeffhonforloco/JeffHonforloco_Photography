import { Link } from 'react-router-dom';

interface PortfolioDropdownProps {
  isOpen: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}

const PortfolioDropdown = ({ isOpen, onMouseEnter, onMouseLeave, onClose }: PortfolioDropdownProps) => {
  const portfolioCategories = [
    { name: 'Beauty', href: '/portfolio/beauty' },
    { name: 'Fashion', href: '/portfolio/fashion' },
    { name: 'Editorial', href: '/portfolio/editorial' },
    { name: 'Glamour', href: '/portfolio/glamour' },
    { name: 'Lifestyle', href: '/portfolio/lifestyle' },
  ];

  return (
    <div 
      className={`absolute top-full left-0 mt-2 w-48 bg-black/95 backdrop-blur-md border border-white/10 rounded-lg shadow-xl transition-all duration-200 pointer-events-auto ${
        isOpen ? 'opacity-100 visible z-[9999]' : 'opacity-0 invisible z-[-1]'
      }`}
      style={{ pointerEvents: 'auto' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="py-2">
        {portfolioCategories.map((category) => (
          <Link
            key={category.name}
            to={category.href}
            className="block px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-200 font-medium cursor-pointer"
            onClick={onClose}
            style={{ pointerEvents: 'auto' }}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PortfolioDropdown;