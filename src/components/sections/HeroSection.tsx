
const HeroSection = () => {
  const portfolioImages = [
    '/lovable-uploads/cd3eb066-6ffe-4e1e-9613-a1b067806092.png',
    '/lovable-uploads/060e27c9-b2d8-4f33-b575-794287894fd6.png',
    '/lovable-uploads/1bb36c8a-ad7c-469a-bc03-92b007c271c3.png',
    '/lovable-uploads/5f1a4833-8606-47d0-8677-805cd81b2558.png',
    '/lovable-uploads/c345b4c2-442d-4dc1-bf20-2c1856ad9e11.png',
    '/lovable-uploads/0987daa0-e6fd-4914-b820-b8b235e70983.png',
    '/lovable-uploads/f36a817e-cd75-4d0b-a900-ce69f01e6afb.png',
    '/lovable-uploads/1290de24-fbc4-4577-a048-fea0e3630a36.png'
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Masonry-style Grid matching reference image */}
      <div className="absolute inset-0 p-2 md:p-3">
        {/* Mobile: 2 columns */}
        <div className="md:hidden grid grid-cols-2 gap-3 h-full">
          {/* Column 1 - Mobile */}
          <div className="flex flex-col gap-3 animate-slide-up-continuous">
            {portfolioImages.filter((_, index) => index % 2 === 0).map((image, index) => (
              <div key={`mobile-col1-${index}`} className="relative group overflow-hidden flex-shrink-0">
                <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
              </div>
            ))}
          </div>
          
          {/* Column 2 - Mobile */}
          <div className="flex flex-col gap-3 animate-slide-up-continuous" style={{ animationDelay: '-15s' }}>
            {portfolioImages.filter((_, index) => index % 2 === 1).map((image, index) => (
              <div key={`mobile-col2-${index}`} className="relative group overflow-hidden flex-shrink-0">
                <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: 3 columns */}
        <div className="hidden md:grid grid-cols-3 gap-4 h-full">
          {/* Column 1 - Desktop */}
          <div className="flex flex-col gap-4 animate-slide-up-continuous">
            {portfolioImages.filter((_, index) => index % 3 === 0).map((image, index) => (
              <div key={`desktop-col1-${index}`} className="relative group overflow-hidden flex-shrink-0">
                <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
              </div>
            ))}
          </div>
          
          {/* Column 2 - Desktop */}
          <div className="flex flex-col gap-4 animate-slide-up-continuous" style={{ animationDelay: '-20s' }}>
            {portfolioImages.filter((_, index) => index % 3 === 1).map((image, index) => (
              <div key={`desktop-col2-${index}`} className="relative group overflow-hidden flex-shrink-0">
                <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-500"></div>
              </div>
            ))}
          </div>
          
          {/* Column 3 - Desktop */}
          <div className="flex flex-col gap-4 animate-slide-up-continuous" style={{ animationDelay: '-10s' }}>
            {portfolioImages.filter((_, index) => index % 3 === 2).map((image, index) => (
              <div key={`desktop-col3-${index}`} className="relative group overflow-hidden flex-shrink-0">
                <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Logo - Centered overlay */}
      <div className="md:hidden absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <img 
          src="/lovable-uploads/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png" 
          alt="J Logo" 
          className="w-72 sm:w-80 filter drop-shadow-2xl brightness-150 contrast-125"
        />
      </div>

      {/* Desktop Logo - Static centered overlay */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center z-20 pointer-events-none">
        <img 
          src="/lovable-uploads/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png" 
          alt="J Logo" 
          className="w-[30rem] lg:w-[36rem] xl:w-[42rem] 2xl:w-[48rem] filter drop-shadow-2xl brightness-150 contrast-125"
        />
      </div>

    </section>
  );
};

export default HeroSection;
