
import { Link } from 'react-router-dom';

const Footer = () => {
  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Portfolio', href: '/portfolio' },
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
              Professional portrait, fashion, and editorial photography with a focus on 
              capturing authentic moments and creating compelling visual narratives that 
              resonate with sophistication and artistic vision.
            </p>
          </div>
          <div>
            <h4 className="font-inter font-medium mb-6 tracking-wider uppercase text-sm">Navigation</h4>
            <div className="space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block text-gray-400 hover:text-photo-red transition-colors duration-300 font-light"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-inter font-medium mb-6 tracking-wider uppercase text-sm">Connect</h4>
            <div className="space-y-4">
              <a href="https://instagram.com/jeffhonforloco" target="_blank" rel="noopener noreferrer" 
                 className="block text-gray-400 hover:text-photo-red transition-colors duration-300 font-light">
                Instagram
              </a>
              <a href="https://youtube.com/@jeffhonforloco" target="_blank" rel="noopener noreferrer" 
                 className="block text-gray-400 hover:text-photo-red transition-colors duration-300 font-light">
                YouTube
              </a>
              <Link to="/contact" className="block text-gray-400 hover:text-photo-red transition-colors duration-300 font-light">
                Book a Session
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
