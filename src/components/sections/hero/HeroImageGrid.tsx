import { useHeroImages } from '../../../hooks/useHeroImages';
import { useState, useEffect } from 'react';

const HeroImageGrid = () => {
  const { portfolioImages, col1Images, col2Images, col3Images } = useHeroImages();
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [totalImages] = useState(6); // Only preload first 6 images for faster initial load

  // Preload critical images for faster loading
  useEffect(() => {
    const preloadImages = portfolioImages.slice(0, totalImages);
    let loaded = 0;
    
    preloadImages.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        setImagesLoaded(loaded);
      };
      img.onerror = () => {
        loaded++;
        setImagesLoaded(loaded);
      };
      img.src = src;
    });
  }, [portfolioImages, totalImages]);

  const renderImage = (image: string, index: number, columnPrefix: string, isDesktop = false) => (
    <div key={`${columnPrefix}-${index}`} className="relative overflow-hidden flex-shrink-0">
      <img 
        src={image} 
        alt={`Jeff Honforloco Portfolio ${(index % portfolioImages.length) + 1} - Fashion Beauty Photography`} 
        className="w-full h-auto object-cover transition-opacity duration-300" 
        loading={index < (isDesktop ? 3 : 2) ? "eager" : "lazy"}
        decoding="async"
        width="400"
        height="600"
        style={{
          opacity: index < totalImages ? (imagesLoaded > index ? 1 : 0.3) : 1
        }}
      />
      <div className="absolute inset-0 bg-black/20"></div>
    </div>
  );

  return (
    <div className="absolute inset-0 p-2 md:p-3">
      {/* Mobile: 2 columns */}
      <div className="md:hidden grid grid-cols-2 gap-3 h-full">
        {/* Column 1 - Mobile */}
        <div className="flex flex-col gap-3 animate-slide-fast">
          {col1Images.map((image, index) => 
            renderImage(image, index, 'mobile-col1')
          )}
        </div>
        
        {/* Column 2 - Mobile */}
        <div className="flex flex-col gap-3 animate-slide-fast" style={{ animationDelay: '-7s' }}>
          {col2Images.map((image, index) => 
            renderImage(image, index, 'mobile-col2')
          )}
        </div>
      </div>

      {/* Desktop: 3 columns */}
      <div className="hidden md:grid grid-cols-3 gap-4 h-full">
        {/* Column 1 - Desktop */}
        <div className="flex flex-col gap-4 animate-slide-medium">
          {col1Images.map((image, index) => 
            renderImage(image, index, 'desktop-col1', true)
          )}
        </div>
        
        {/* Column 2 - Desktop */}
        <div className="flex flex-col gap-4 animate-slide-medium" style={{ animationDelay: '-8s' }}>
          {col2Images.map((image, index) => 
            renderImage(image, index, 'desktop-col2', true)
          )}
        </div>
        
        {/* Column 3 - Desktop */}
        <div className="flex flex-col gap-4 animate-slide-medium" style={{ animationDelay: '-16s' }}>
          {col3Images.map((image, index) => 
            renderImage(image, index, 'desktop-col3', true)
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroImageGrid;