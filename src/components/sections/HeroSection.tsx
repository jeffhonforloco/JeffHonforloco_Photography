
import { useState, useEffect } from 'react';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const portfolioImages = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2048&q=95',
    'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=2048&q=95',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2048&q=95',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=2048&q=95',
    'https://images.unsplash.com/photo-1506629905963-b3b17f54e5b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2048&q=95',
    'https://images.unsplash.com/photo-1518577915332-c2a19f149a75?ixlib=rb-4.0.3&auto=format&fit=crop&w=2048&q=95',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2048&q=95',
    'https://images.unsplash.com/photo-1512646605205-78422b7c7896?ixlib=rb-4.0.3&auto=format&fit=crop&w=2048&q=95',
    'https://images.unsplash.com/photo-1539571696520-9f2891b92ac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2048&q=95'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % portfolioImages.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [portfolioImages.length]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-gray-50 to-blue-50">
      {/* Enhanced Image Collage - Bright and High Resolution */}
      <div className="absolute inset-0 flex gap-4 p-4 lg:gap-6 lg:p-6">
        {/* Column 1 */}
        <div className="flex-1 relative overflow-hidden">
          <div className="animate-slide-up-slow" style={{animationDuration: '180s'}}>
            <div className="flex flex-col gap-4 lg:gap-6">
              {portfolioImages.concat(portfolioImages).map((image, index) => (
                <div key={`col1-${index}`} className="h-[60vh] lg:h-[70vh] relative group">
                  <img
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover rounded-3xl shadow-2xl transition-all duration-700 group-hover:shadow-3xl brightness-110 contrast-115 saturate-125 hover:scale-[1.02]"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/10 rounded-3xl"></div>
                  <div className="absolute inset-0 ring-1 ring-white/20 rounded-3xl"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 2 */}
        <div className="flex-1 relative overflow-hidden">
          <div className="animate-slide-up-slow" style={{animationDuration: '180s', animationDelay: '-60s'}}>
            <div className="flex flex-col gap-4 lg:gap-6">
              {portfolioImages.slice(3).concat(portfolioImages.slice(0, 3)).concat(portfolioImages.slice(3)).concat(portfolioImages.slice(0, 3)).map((image, index) => (
                <div key={`col2-${index}`} className="h-[60vh] lg:h-[70vh] relative group">
                  <img
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover rounded-3xl shadow-2xl transition-all duration-700 group-hover:shadow-3xl brightness-110 contrast-115 saturate-125 hover:scale-[1.02]"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/10 rounded-3xl"></div>
                  <div className="absolute inset-0 ring-1 ring-white/20 rounded-3xl"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3 - Hidden on mobile */}
        <div className="hidden md:flex flex-1 relative overflow-hidden">
          <div className="animate-slide-up-slow" style={{animationDuration: '180s', animationDelay: '-120s'}}>
            <div className="flex flex-col gap-4 lg:gap-6">
              {portfolioImages.slice(6).concat(portfolioImages.slice(0, 6)).concat(portfolioImages.slice(6)).concat(portfolioImages.slice(0, 6)).map((image, index) => (
                <div key={`col3-${index}`} className="h-[60vh] lg:h-[70vh] relative group">
                  <img
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-full object-cover rounded-3xl shadow-2xl transition-all duration-700 group-hover:shadow-3xl brightness-110 contrast-115 saturate-125 hover:scale-[1.02]"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8fafc';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/10 rounded-3xl"></div>
                  <div className="absolute inset-0 ring-1 ring-white/20 rounded-3xl"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bright Overlay with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/20 to-white/30 z-10"></div>

      {/* Central Logo with enhanced bright presentation */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <img 
              src="/lovable-uploads/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png" 
              alt="J Logo" 
              className="w-72 md:w-80 lg:w-96 xl:w-[28rem] 2xl:w-[32rem] mx-auto filter drop-shadow-2xl brightness-105 hover:brightness-110 transition-all duration-700 hover:scale-105"
              style={{ imageRendering: 'crisp-edges' }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-full blur-2xl"></div>
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
          </div>
          
          {/* Enhanced tagline for bright theme */}
          <div className="mt-8 opacity-0 animate-fade-in" style={{ animationDelay: '1s', animationFillMode: 'forwards' }}>
            <p className="text-gray-800 text-lg md:text-xl lg:text-2xl font-light tracking-wide max-w-2xl mx-auto leading-relaxed backdrop-blur-sm bg-white/30 rounded-2xl px-6 py-3 border border-white/40">
              Capturing moments that shine with brilliance and beauty
            </p>
          </div>
        </div>
      </div>

      {/* Floating elements for depth */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-32 right-32 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '-2s' }}></div>
      <div className="absolute top-1/2 left-10 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-red-400/20 rounded-full blur-xl animate-float" style={{ animationDelay: '-4s' }}></div>
    </section>
  );
};

export default HeroSection;
