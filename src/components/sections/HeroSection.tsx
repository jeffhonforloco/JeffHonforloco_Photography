
import { useState, useEffect } from 'react';
import { Share2, Instagram, Youtube, Facebook } from 'lucide-react';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const portfolioImages = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506629905963-b3b17f54e5b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518577915332-c2a19f149a75?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512646605205-78422b7c7896?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539571696520-9f2891b92ac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % portfolioImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [portfolioImages.length]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Three Column Image Collage with Infinite Scroll */}
      <div className="absolute inset-0 flex">
        {/* Column 1 */}
        <div className="flex-1 relative overflow-hidden">
          <div className="animate-slide-up-slow" style={{animationDuration: '40s'}}>
            <div className="flex flex-col">
              {portfolioImages.concat(portfolioImages).map((image, index) => (
                <div key={`col1-${index}`} className="h-[70vh] mb-4">
                  <img
                    src={image}
                    alt={`Editorial ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.backgroundColor = '#000';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex-1 relative overflow-hidden">
          <div className="animate-slide-up-slow" style={{animationDuration: '35s', animationDelay: '-10s'}}>
            <div className="flex flex-col">
              {portfolioImages.slice(3).concat(portfolioImages.slice(0, 3)).concat(portfolioImages.slice(3)).concat(portfolioImages.slice(0, 3)).map((image, index) => (
                <div key={`col2-${index}`} className="h-[60vh] mb-4">
                  <img
                    src={image}
                    alt={`Editorial ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.backgroundColor = '#000';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3 */}
        <div className="flex-1 relative overflow-hidden">
          <div className="animate-slide-up-slow" style={{animationDuration: '45s', animationDelay: '-20s'}}>
            <div className="flex flex-col">
              {portfolioImages.slice(6).concat(portfolioImages.slice(0, 6)).concat(portfolioImages.slice(6)).concat(portfolioImages.slice(0, 6)).map((image, index) => (
                <div key={`col3-${index}`} className="h-[80vh] mb-4">
                  <img
                    src={image}
                    alt={`Editorial ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.backgroundColor = '#000';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {/* Central Logo */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="text-center animate-fade-in">
          <img 
            src="/lovable-uploads/f17266df-16a1-4edd-8581-23b10bdb2eda.png" 
            alt="J Logo" 
            className="w-48 h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96 mx-auto filter drop-shadow-2xl opacity-95 hover:opacity-100 transition-opacity duration-500"
          />
        </div>
      </div>

      {/* Floating Share Menu */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-30">
        <div className="relative">
          <button
            onClick={() => setIsShareOpen(!isShareOpen)}
            className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 group"
          >
            <Share2 className={`w-5 h-5 transition-transform duration-300 ${isShareOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {/* Social Links */}
          <div className={`absolute right-16 top-0 flex items-center space-x-4 transition-all duration-500 ${
            isShareOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
          }`}>
            <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300">
              <Youtube className="w-4 h-4" />
            </a>
            <a href="#" className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-3">
          {portfolioImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="w-px h-8 bg-gradient-to-b from-transparent via-white to-transparent"></div>
      </div>
    </section>
  );
};

export default HeroSection;
