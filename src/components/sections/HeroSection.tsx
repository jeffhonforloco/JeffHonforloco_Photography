
const HeroSection = () => {
  const portfolioImages = [
    '/lovable-uploads/cd3eb066-6ffe-4e1e-9613-a1b067806092.png',
    '/lovable-uploads/060e27c9-b2d8-4f33-b575-794287894fd6.png',
    '/lovable-uploads/1bb36c8a-ad7c-469a-bc03-92b007c271c3.png',
    '/lovable-uploads/5f1a4833-8606-47d0-8677-805cd81b2558.png',
    '/lovable-uploads/c345b4c2-442d-4dc1-bf20-2c1856ad9e11.png',
    '/lovable-uploads/0987daa0-e6fd-4914-b820-b8b235e70983.png',
    '/lovable-uploads/f36a817e-cd75-4d0b-a900-ce69f01e6afb.png',
    '/lovable-uploads/1290de24-fbc4-4577-a048-fea0e3630a36.png',
    '/lovable-uploads/bcbe9d80-3fd0-494c-a9e9-a4d5ab099c02.png',
    '/lovable-uploads/13e3124a-ebf5-4084-94fa-5b85aacda039.png',
    '/lovable-uploads/04f6a5f8-91e9-4568-84ae-63cac4830a52.png',
    '/lovable-uploads/2523c649-4617-43c2-9e9e-ebf4ee328067.png',
    '/lovable-uploads/b573482f-31ab-49e5-af48-586d9aeb6909.png',
    '/lovable-uploads/be107293-394e-46fd-9fcd-d1eb5781ff56.png',
    '/lovable-uploads/7c28c520-783d-4733-ad48-9683204ef054.png',
    '/lovable-uploads/c279306c-86cb-49fe-a393-c5330888db34.png'
  ];

  // Create seamless loop with shuffled images to prevent obvious duplicates
  const shuffledImages = [...portfolioImages.slice(8), ...portfolioImages, ...portfolioImages.slice(0, 8)];
  const seamlessImages = shuffledImages;

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Hidden SEO content */}
      <h1 className="sr-only">Jeff Honforloco Photography - Luxury Fashion & Beauty Photographer | Nationwide Bookings NYC, LA, Miami, Chicago</h1>
      
      {/* Masonry-style Grid matching reference image */}
      <div className="absolute inset-0 p-2 md:p-3">
        {/* Mobile: 2 columns */}
        <div className="md:hidden grid grid-cols-2 gap-3 h-full">
          {/* Column 1 - Mobile */}
          <div className="flex flex-col gap-3 animate-slide-seamless">
            {seamlessImages.filter((_, index) => index % 2 === 0).map((image, index) => (
              <div key={`mobile-col1-${index}`} className="relative overflow-hidden flex-shrink-0">
                <img 
                  src={image} 
                  alt={`Jeff Honforloco Portfolio ${(index % portfolioImages.length) + 1} - Fashion Beauty Photography`} 
                  className="w-full h-auto object-cover" 
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index < 2 ? "high" : "low"}
                  width="400"
                  height="600"
                />
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            ))}
          </div>
          
          {/* Column 2 - Mobile */}
          <div className="flex flex-col gap-3 animate-slide-seamless" style={{ animationDelay: '-20s' }}>
            {seamlessImages.filter((_, index) => index % 2 === 1).map((image, index) => (
              <div key={`mobile-col2-${index}`} className="relative overflow-hidden flex-shrink-0">
                <img 
                  src={image} 
                  alt={`Jeff Honforloco Portfolio ${(index % portfolioImages.length) + 1} - Fashion Beauty Photography`} 
                  className="w-full h-auto object-cover" 
                  loading={index < 2 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index < 2 ? "high" : "low"}
                  width="400"
                  height="600"
                />
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: 3 columns */}
        <div className="hidden md:grid grid-cols-3 gap-4 h-full">
          {/* Column 1 - Desktop */}
          <div className="flex flex-col gap-4 animate-slide-seamless">
            {seamlessImages.filter((_, index) => index % 3 === 0).map((image, index) => (
              <div key={`desktop-col1-${index}`} className="relative overflow-hidden flex-shrink-0">
                <img 
                  src={image} 
                  alt={`Jeff Honforloco Portfolio ${(index % portfolioImages.length) + 1} - Fashion Beauty Photography`} 
                  className="w-full h-auto object-cover" 
                  loading={index < 3 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index < 3 ? "high" : "low"}
                  width="400"
                  height="600"
                />
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            ))}
          </div>
          
          {/* Column 2 - Desktop */}
          <div className="flex flex-col gap-4 animate-slide-seamless" style={{ animationDelay: '-27s' }}>
            {seamlessImages.filter((_, index) => index % 3 === 1).map((image, index) => (
              <div key={`desktop-col2-${index}`} className="relative overflow-hidden flex-shrink-0">
                <img 
                  src={image} 
                  alt={`Jeff Honforloco Portfolio ${(index % portfolioImages.length) + 1} - Fashion Beauty Photography`} 
                  className="w-full h-auto object-cover" 
                  loading={index < 3 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index < 3 ? "high" : "low"}
                  width="400"
                  height="600"
                />
                <div className="absolute inset-0 bg-black/30"></div>
              </div>
            ))}
          </div>
          
          {/* Column 3 - Desktop */}
          <div className="flex flex-col gap-4 animate-slide-seamless" style={{ animationDelay: '-13s' }}>
            {seamlessImages.filter((_, index) => index % 3 === 2).map((image, index) => (
              <div key={`desktop-col3-${index}`} className="relative overflow-hidden flex-shrink-0">
                <img 
                  src={image} 
                  alt={`Jeff Honforloco Portfolio ${(index % portfolioImages.length) + 1} - Fashion Beauty Photography`} 
                  className="w-full h-auto object-cover" 
                  loading={index < 3 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={index < 3 ? "high" : "low"}
                  width="400"
                  height="600"
                />
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Logo - Perfectly centered overlay */}
      <div className="md:hidden absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div className="flex items-center justify-center w-full h-full">
          <img 
            src="/lovable-uploads/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png" 
            alt="J Logo" 
            className="w-72 sm:w-80 max-w-[80vw] h-auto filter drop-shadow-2xl brightness-150 contrast-125"
          />
        </div>
      </div>

      {/* Desktop Logo & Hero Text - Static centered overlay */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center z-20 pointer-events-none">
        <div className="text-center">
          <img 
            src="/lovable-uploads/ff1ac4ba-08e6-4647-8c5c-5e76943f6cfa.png" 
            alt="Jeff Honforloco Photography Logo" 
            className="w-[24rem] lg:w-[28rem] xl:w-[32rem] 2xl:w-[36rem] filter drop-shadow-2xl brightness-150 contrast-125 mx-auto mb-8"
          />
          <div className="max-w-4xl mx-auto px-8">
            <h2 className="font-playfair text-3xl lg:text-4xl xl:text-5xl font-light text-white mb-6 tracking-wider leading-tight">
              LUXURY FASHION & BEAUTY PHOTOGRAPHY
            </h2>
            <p className="font-inter text-lg lg:text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              Nationwide bookings for high-end brands, celebrities & models
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
              <a 
                href="/contact" 
                className="bg-photo-red hover:bg-photo-red-hover text-white px-8 py-4 font-semibold tracking-wider uppercase text-sm transition-all duration-300 hover:scale-105 rounded-lg shadow-2xl"
              >
                Book Your Session
              </a>
              <a 
                href="/portfolio" 
                className="border-2 border-white/80 text-white hover:bg-white/10 px-8 py-4 font-semibold tracking-wider uppercase text-sm transition-all duration-300 hover:scale-105 rounded-lg backdrop-blur-sm"
              >
                View Portfolio
              </a>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
