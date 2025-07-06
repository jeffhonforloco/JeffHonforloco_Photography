
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
          <div className="flex flex-col gap-1">
            <div className="relative group overflow-hidden rounded-lg h-[35vh]">
              <img src={portfolioImages[0]} alt="Portfolio 1" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
            </div>
            <div className="relative group overflow-hidden rounded-lg h-[25vh]">
              <img src={portfolioImages[1]} alt="Portfolio 2" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
            </div>
            <div className="relative group overflow-hidden rounded-lg h-[30vh]">
              <img src={portfolioImages[2]} alt="Portfolio 3" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
            </div>
          </div>
          
          {/* Column 2 - Mobile */}
          <div className="flex flex-col gap-1">
            <div className="relative group overflow-hidden rounded-lg h-[30vh]">
              <img src={portfolioImages[3]} alt="Portfolio 4" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
            </div>
            <div className="relative group overflow-hidden rounded-lg h-[40vh]">
              <img src={portfolioImages[4]} alt="Portfolio 5" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
            </div>
            <div className="relative group overflow-hidden rounded-lg h-[20vh]">
              <img src={portfolioImages[5]} alt="Portfolio 6" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
            </div>
          </div>
        </div>

        {/* Desktop: 3 columns */}
        <div className="hidden md:grid grid-cols-3 gap-2 h-full">
          {/* Column 1 - Desktop */}
          <div className="flex flex-col gap-2">
            <div className="relative group overflow-hidden rounded-xl h-[45vh]">
              <img src={portfolioImages[0]} alt="Portfolio 1" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
            </div>
            <div className="relative group overflow-hidden rounded-xl h-[30vh]">
              <img src={portfolioImages[1]} alt="Portfolio 2" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
            </div>
            <div className="relative group overflow-hidden rounded-xl h-[20vh]">
              <img src={portfolioImages[2]} alt="Portfolio 3" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
            </div>
          </div>
          
          {/* Column 2 - Desktop (with logo overlay area) */}
          <div className="flex flex-col gap-2">
            <div className="relative group overflow-hidden rounded-xl h-[25vh]">
              <img src={portfolioImages[3]} alt="Portfolio 4" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
            </div>
            <div className="relative group overflow-hidden rounded-xl h-[50vh]">
              <img src={portfolioImages[4]} alt="Portfolio 5" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-500"></div>
              {/* Logo overlay area */}
              <div className="absolute inset-0 flex items-center justify-center">
                <img 
                  src="/lovable-uploads/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png" 
                  alt="J Logo" 
                  className="w-32 md:w-40 lg:w-48 filter drop-shadow-2xl opacity-90"
                />
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-xl h-[20vh]">
              <img src={portfolioImages[5]} alt="Portfolio 6" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
            </div>
          </div>
          
          {/* Column 3 - Desktop */}
          <div className="flex flex-col gap-2">
            <div className="relative group overflow-hidden rounded-xl h-[35vh]">
              <img src={portfolioImages[6]} alt="Portfolio 7" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
            </div>
            <div className="relative group overflow-hidden rounded-xl h-[40vh]">
              <img src={portfolioImages[7]} alt="Portfolio 8" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
            </div>
            <div className="relative group overflow-hidden rounded-xl h-[20vh]">
              <img src={portfolioImages[8]} alt="Portfolio 9" className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Logo - Centered overlay */}
      <div className="md:hidden absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <img 
          src="/lovable-uploads/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png" 
          alt="J Logo" 
          className="w-32 sm:w-40 filter drop-shadow-2xl opacity-90"
        />
      </div>

    </section>
  );
};

export default HeroSection;
