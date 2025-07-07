
const HeroSection = () => {
  const portfolioImages = [
    '/lovable-uploads/4a4d1d70-8ce9-4c45-b96c-f46b3bb46863.png',
    '/lovable-uploads/69f2a872-9dde-4972-bb6a-e11577de7fec.png',
    '/lovable-uploads/62b49f7c-4f73-4d92-881f-45f2809087b1.png',
    '/lovable-uploads/6a95f17f-c979-43f4-9323-c4f01731a191.png',
    '/lovable-uploads/d1ac41f4-eab2-40c7-8c53-61d619ab77c3.png',
    '/lovable-uploads/d0aa1656-0697-40c8-aad3-a3756945228a.png',
    '/lovable-uploads/db51011f-18fe-4e40-8977-b0b6a211a396.png',
    '/lovable-uploads/3773cab4-5d54-45b9-befe-7e8b70874496.png',
    '/lovable-uploads/e8cb69bc-d69a-44f0-9d6d-54cff80fa950.png',
    '/lovable-uploads/c2476d8c-8e52-43a0-ac77-33d818c3fa2d.png',
    '/lovable-uploads/bbbddcaa-c94f-4035-9aa8-16a225d5b527.png',
    '/lovable-uploads/e06927fa-9c52-4746-895c-f21667b0197e.png',
    '/lovable-uploads/3b2350e8-72d9-4325-bd13-a5b6ceec335f.png',
    '/lovable-uploads/e30bcff1-8487-49cd-89f3-464e539e26c3.png',
    '/lovable-uploads/28ccb7e7-ed7f-4185-ad8b-8bacc6443c8f.png',
    '/lovable-uploads/d0c57cf0-4228-4e1e-8c62-5cf93ca380a5.png',
    '/lovable-uploads/3566a61b-2d58-4e4a-920f-b2f011f69289.png',
    '/lovable-uploads/3d46d1ef-3d6f-4cf4-b3e4-f62aa6b7323d.png',
    '/lovable-uploads/9bed3b4d-3641-4170-91ba-2765ea59db49.png'
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Masonry-style Grid matching reference image */}
      <div className="absolute inset-0 p-2 md:p-3">
        {/* Mobile: 2 columns */}
        <div className="md:hidden grid grid-cols-2 gap-3 h-full">
          {/* Column 1 - Mobile */}
          <div className="flex flex-col gap-3 animate-slide-up-continuous">
            {portfolioImages.concat(portfolioImages).map((image, index) => (
              <div key={`mobile-col1-${index}`} className="relative group overflow-hidden flex-shrink-0">
                <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
              </div>
            ))}
          </div>
          
          {/* Column 2 - Mobile */}
          <div className="flex flex-col gap-3 animate-slide-up-continuous" style={{ animationDelay: '-15s' }}>
            {portfolioImages.slice(3).concat(portfolioImages.slice(0, 3)).concat(portfolioImages.slice(3)).concat(portfolioImages.slice(0, 3)).map((image, index) => (
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
            {portfolioImages.concat(portfolioImages).map((image, index) => (
              <div key={`desktop-col1-${index}`} className="relative group overflow-hidden flex-shrink-0">
                <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-500"></div>
              </div>
            ))}
          </div>
          
          {/* Column 2 - Desktop */}
          <div className="flex flex-col gap-4 animate-slide-up-continuous" style={{ animationDelay: '-20s' }}>
            {portfolioImages.slice(3).concat(portfolioImages.slice(0, 3)).concat(portfolioImages.slice(3)).concat(portfolioImages.slice(0, 3)).map((image, index) => (
              <div key={`desktop-col2-${index}`} className="relative group overflow-hidden flex-shrink-0">
                <img src={image} alt={`Portfolio ${index + 1}`} className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-500"></div>
              </div>
            ))}
          </div>
          
          {/* Column 3 - Desktop */}
          <div className="flex flex-col gap-4 animate-slide-up-continuous" style={{ animationDelay: '-10s' }}>
            {portfolioImages.slice(6).concat(portfolioImages.slice(0, 6)).concat(portfolioImages.slice(6)).concat(portfolioImages.slice(0, 6)).map((image, index) => (
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
