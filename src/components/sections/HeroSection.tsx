
const HeroSection = () => {
  const portfolioImages = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=95',
    'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=95',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=95',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=95',
    'https://images.unsplash.com/photo-1506629905963-b3b17f54e5b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=95',
    'https://images.unsplash.com/photo-1518577915332-c2a19f149a75?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=95',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=95',
    'https://images.unsplash.com/photo-1512646605205-78422b7c7896?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=95',
    'https://images.unsplash.com/photo-1539571696520-9f2891b92ac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=95'
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Masonry-style Grid matching reference image */}
      <div className="absolute inset-0 p-1 md:p-2">
        {/* Mobile: 2 columns */}
        <div className="md:hidden grid grid-cols-2 gap-1 h-full">
          {/* Column 1 - Mobile */}
          <div className="flex flex-col gap-1 animate-slide-up-continuous">
            {portfolioImages.concat(portfolioImages).map((image, index) => (
              <div key={`mobile-col1-${index}`} className="relative group overflow-hidden h-[35vh] flex-shrink-0">
                <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
              </div>
            ))}
          </div>
          
          {/* Column 2 - Mobile */}
          <div className="flex flex-col gap-1 animate-slide-up-continuous" style={{ animationDelay: '-15s' }}>
            {portfolioImages.slice(3).concat(portfolioImages.slice(0, 3)).concat(portfolioImages.slice(3)).concat(portfolioImages.slice(0, 3)).map((image, index) => (
              <div key={`mobile-col2-${index}`} className="relative group overflow-hidden h-[35vh] flex-shrink-0">
                <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: 3 columns */}
        <div className="hidden md:grid grid-cols-3 gap-2 h-full">
          {/* Column 1 - Desktop */}
          <div className="flex flex-col gap-2 animate-slide-up-continuous">
            {portfolioImages.concat(portfolioImages).map((image, index) => (
              <div key={`desktop-col1-${index}`} className="relative group overflow-hidden h-[40vh] flex-shrink-0">
                <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
              </div>
            ))}
          </div>
          
          {/* Column 2 - Desktop */}
          <div className="flex flex-col gap-2 animate-slide-up-continuous" style={{ animationDelay: '-20s' }}>
            {portfolioImages.slice(3).concat(portfolioImages.slice(0, 3)).concat(portfolioImages.slice(3)).concat(portfolioImages.slice(0, 3)).map((image, index) => (
              <div key={`desktop-col2-${index}`} className="relative group overflow-hidden h-[40vh] flex-shrink-0">
                <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-500"></div>
              </div>
            ))}
          </div>
          
          {/* Column 3 - Desktop */}
          <div className="flex flex-col gap-2 animate-slide-up-continuous" style={{ animationDelay: '-10s' }}>
            {portfolioImages.slice(6).concat(portfolioImages.slice(0, 6)).concat(portfolioImages.slice(6)).concat(portfolioImages.slice(0, 6)).map((image, index) => (
              <div key={`desktop-col3-${index}`} className="relative group overflow-hidden h-[40vh] flex-shrink-0">
                <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Logo - Centered overlay */}
      <div className="md:hidden absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div className="bg-black/40 rounded-lg p-4">
          <img 
            src="/lovable-uploads/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png" 
            alt="J Logo" 
            className="w-32 sm:w-40 filter drop-shadow-2xl opacity-90"
          />
        </div>
      </div>

      {/* Desktop Logo - Static centered overlay */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center z-20 pointer-events-none">
        <div className="bg-black/40 rounded-lg p-6">
          <img 
            src="/lovable-uploads/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png" 
            alt="J Logo" 
            className="w-40 lg:w-48 xl:w-56 filter drop-shadow-2xl opacity-90"
          />
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
