import { useHeroImages } from '../../../hooks/useHeroImages';
import { useState, useEffect } from 'react';

const HeroImageGrid = () => {
  const { portfolioImages } = useHeroImages();
  const [visibleImages, setVisibleImages] = useState<string[]>([]);

  useEffect(() => {
    // Show 6 random images from the collection for the mosaic
    const shuffled = [...portfolioImages].sort(() => 0.5 - Math.random());
    setVisibleImages(shuffled.slice(0, 6));
  }, [portfolioImages]);

  return (
    <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 md:gap-2">
      {/* Large featured image - top left */}
      <div className="col-span-2 row-span-2 relative overflow-hidden">
        {visibleImages[0] && (
          <img 
            src={visibleImages[0]}
            alt="Featured Portfolio" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Top right image */}
      <div className="col-span-2 row-span-1 relative overflow-hidden">
        {visibleImages[1] && (
          <img 
            src={visibleImages[1]}
            alt="Portfolio Image" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Middle right image */}
      <div className="col-span-1 row-span-1 relative overflow-hidden">
        {visibleImages[2] && (
          <img 
            src={visibleImages[2]}
            alt="Portfolio Image" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Another middle right image */}
      <div className="col-span-1 row-span-1 relative overflow-hidden">
        {visibleImages[3] && (
          <img 
            src={visibleImages[3]}
            alt="Portfolio Image" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Bottom left image */}
      <div className="col-span-1 row-span-2 relative overflow-hidden">
        {visibleImages[4] && (
          <img 
            src={visibleImages[4]}
            alt="Portfolio Image" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Bottom center image */}
      <div className="col-span-1 row-span-2 relative overflow-hidden">
        {visibleImages[5] && (
          <img 
            src={visibleImages[5]}
            alt="Portfolio Image" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Bottom right large image */}
      <div className="col-span-2 row-span-2 relative overflow-hidden">
        {visibleImages[0] && (
          <img 
            src={portfolioImages[(portfolioImages.indexOf(visibleImages[0]) + 6) % portfolioImages.length]}
            alt="Portfolio Image" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
          />
        )}
        <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors duration-300" />
      </div>
    </div>
  );
};

export default HeroImageGrid;