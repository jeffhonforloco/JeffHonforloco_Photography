import { useHeroImages } from '../../../hooks/useHeroImages';

const HeroImageGrid = () => {
  const { portfolioImages, col1Images, col2Images, col3Images } = useHeroImages();

  return (
    <div className="absolute inset-0 p-2 md:p-3">
      {/* Mobile: 2 columns */}
      <div className="md:hidden grid grid-cols-2 gap-3 h-full">
        {/* Column 1 - Mobile */}
        <div className="flex flex-col gap-3 animate-slide-seamless">
          {col1Images.map((image, index) => (
            <div key={`mobile-col1-${index}`} className="relative overflow-hidden flex-shrink-0">
              <img 
                src={image} 
                alt={`Jeff Honforloco Portfolio ${(index % portfolioImages.length) + 1} - Fashion Beauty Photography`} 
                className="w-full h-auto object-cover" 
                loading={index < 2 ? "eager" : "lazy"}
                decoding="async"
                width="400"
                height="600"
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          ))}
        </div>
        
        {/* Column 2 - Mobile */}
        <div className="flex flex-col gap-3 animate-slide-seamless" style={{ animationDelay: '-20s' }}>
          {col2Images.map((image, index) => (
            <div key={`mobile-col2-${index}`} className="relative overflow-hidden flex-shrink-0">
              <img 
                src={image} 
                alt={`Jeff Honforloco Portfolio ${(index % portfolioImages.length) + 1} - Fashion Beauty Photography`} 
                className="w-full h-auto object-cover" 
                loading={index < 2 ? "eager" : "lazy"}
                decoding="async"
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
          {col1Images.map((image, index) => (
            <div key={`desktop-col1-${index}`} className="relative overflow-hidden flex-shrink-0">
              <img 
                src={image} 
                alt={`Jeff Honforloco Portfolio ${(index % portfolioImages.length) + 1} - Fashion Beauty Photography`} 
                className="w-full h-auto object-cover" 
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
                width="400"
                height="600"
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          ))}
        </div>
        
        {/* Column 2 - Desktop */}
        <div className="flex flex-col gap-4 animate-slide-seamless" style={{ animationDelay: '-27s' }}>
          {col2Images.map((image, index) => (
            <div key={`desktop-col2-${index}`} className="relative overflow-hidden flex-shrink-0">
              <img 
                src={image} 
                alt={`Jeff Honforloco Portfolio ${(index % portfolioImages.length) + 1} - Fashion Beauty Photography`} 
                className="w-full h-auto object-cover" 
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
                width="400"
                height="600"
              />
              <div className="absolute inset-0 bg-black/30"></div>
            </div>
          ))}
        </div>
        
        {/* Column 3 - Desktop */}
        <div className="flex flex-col gap-4 animate-slide-seamless" style={{ animationDelay: '-13s' }}>
          {col3Images.map((image, index) => (
            <div key={`desktop-col3-${index}`} className="relative overflow-hidden flex-shrink-0">
              <img 
                src={image} 
                alt={`Jeff Honforloco Portfolio ${(index % portfolioImages.length) + 1} - Fashion Beauty Photography`} 
                className="w-full h-auto object-cover" 
                loading={index < 3 ? "eager" : "lazy"}
                decoding="async"
                width="400"
                height="600"
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroImageGrid;