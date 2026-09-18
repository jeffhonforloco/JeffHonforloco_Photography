
import { Link } from 'react-router-dom';
import { SERVICE_AUTHORITY_LINKS } from '@/data/service-authority-data';

const Footer = () => {
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Portfolio', href: '/portfolios' },
    { name: 'Journal', href: '/journal' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <footer className="border-t border-gray-800 py-32 md:py-40">
      <div className="max-w-8xl mx-auto px-8 md:px-16">
        <div className="grid md:grid-cols-3 gap-16">
          <div>
            <h3 className="font-playfair text-3xl font-light mb-6">Jeff Honforloco</h3>
            <p className="text-lg md:text-xl font-light leading-relaxed text-gray-400">
              Jeff Honforloco Photography – Fashion & Beauty Photographer | USA
            </p>
            <div className="mt-6 space-y-2 text-gray-400 font-light">
              <p>Providence, Rhode Island</p>
              <a href="tel:+16463794237" className="block hover:text-photo-red-bright transition-colors duration-300">
                +1 (646) 379-4237
              </a>
              <a href="mailto:info@jeffhonforlocophotos.com" className="block hover:text-photo-red-bright transition-colors duration-300">
                info@jeffhonforlocophotos.com
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-inter font-medium mb-6 tracking-wider uppercase text-sm">Providence Services</h4>
            <div className="space-y-4">
              {SERVICE_AUTHORITY_LINKS.map((item) => (
                <Link key={item.path} to={item.path} className="block text-gray-400 hover:text-photo-red-bright transition-colors duration-300 font-light">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-inter font-medium mb-6 tracking-wider uppercase text-sm">Navigation</h4>
            <div className="space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block text-gray-400 hover:text-photo-red-bright transition-colors duration-300 font-light"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 mt-16 pt-8 text-center">
          <p className="text-gray-400 font-light tracking-wide">
            © 2026 Jeff Honforloco Photography. All rights reserved.
          </p>
          <Link
            to="/privacy"
            className="inline-block mt-3 text-sm text-gray-500 hover:text-photo-red-bright transition-colors duration-300 font-light"
          >
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
