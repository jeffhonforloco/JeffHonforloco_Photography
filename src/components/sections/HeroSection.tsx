
import { useState, useEffect } from 'react';

const HeroSection = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

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
    }, 8000); // Slowed down from 5000ms to 8000ms
    return () => clearInterval(timer);
  }, [portfolioImages.length]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Image Collage - 2 columns on mobile, 3 on desktop */}
      <div className="absolute inset-0 flex gap-4 p-4">
        {/* Column 1 */}
        <div className="flex-1 relative overflow-hidden">
          <div className="animate-slide-up-slow" style={{animationDuration: '180s'}}>
            <div className="flex flex-col gap-4">
              {portfolioImages.concat(portfolioImages).map((image, index) => (
                <div key={`col1-${index}`} className="h-[70vh]">
                  <img
                    src={image}
                    alt={`Editorial ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
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
          <div className="animate-slide-up-slow" style={{animationDuration: '180s', animationDelay: '-60s'}}>
            <div className="flex flex-col gap-4">
              {portfolioImages.slice(3).concat(portfolioImages.slice(0, 3)).concat(portfolioImages.slice(3)).concat(portfolioImages.slice(0, 3)).map((image, index) => (
                <div key={`col2-${index}`} className="h-[60vh]">
                  <img
                    src={image}
                    alt={`Editorial ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.backgroundColor = '#000';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3 - Hidden on mobile */}
        <div className="hidden md:flex flex-1 relative overflow-hidden">
          <div className="animate-slide-up-slow" style={{animationDuration: '180s', animationDelay: '-120s'}}>
            <div className="flex flex-col gap-4">
              {portfolioImages.slice(6).concat(portfolioImages.slice(0, 6)).concat(portfolioImages.slice(6)).concat(portfolioImages.slice(0, 6)).map((image, index) => (
                <div key={`col3-${index}`} className="h-[80vh]">
                  <img
                    src={image}
                    alt={`Editorial ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg"
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
            src="/lovable-uploads/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png" 
            alt="J Logo" 
            className="w-80 md:w-96 lg:w-[30rem] xl:w-[36rem] mx-auto filter drop-shadow-2xl opacity-95 hover:opacity-100 transition-opacity duration-500"
          />
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
