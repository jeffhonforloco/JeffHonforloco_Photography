import { useHeroImages } from '../../../hooks/useHeroImages';
import { useState, useEffect, useRef, useCallback } from 'react';

const HeroImageGrid = () => {
  const { portfolioImages, col1Images, col2Images, col3Images } = useHeroImages();
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (!node) return;
    
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            setLoadedImages(prev => new Set(prev).add(img.src));
          }
        }
      });
    }, { rootMargin: '50px' });
    
    observerRef.current.observe(node);
  }, []);

  // Preload first few critical images only
  useEffect(() => {
    const criticalImages = portfolioImages.slice(0, 3);
    criticalImages.forEach((src) => {
      const img = new Image();
      img.onload = () => setLoadedImages(prev => new Set(prev).add(src));
      img.src = src;
    });
  }, [portfolioImages]);

  const renderImage = (image: string, index: number, columnPrefix: string, isDesktop = false) => {
    const isCritical = index < 3;
    const isLoaded = loadedImages.has(image);
    
    return (
      <div key={`${columnPrefix}-${index}`} className="relative overflow-hidden flex-shrink-0">
        <img 
          ref={!isCritical ? imgRef : undefined}
          src={isCritical ? image : undefined}
          data-src={!isCritical ? image : undefined}
          alt={`Jeff Honforloco Portfolio ${(index % portfolioImages.length) + 1} - Fashion Beauty Photography`} 
          className={`w-full h-auto object-cover transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-30'}`}
          loading={isCritical ? "eager" : "lazy"}
          decoding="async"
          width="400"
          height="600"
        />
        <div className="absolute inset-0 bg-black/20"></div>
      </div>
    );
  };

  return (
    <div className="absolute inset-0 p-2 md:p-3">
      {/* Mobile: 2 columns */}
      <div className="md:hidden grid grid-cols-2 gap-3 h-full">
        {/* Column 1 - Mobile */}
        <div className="flex flex-col gap-3 animate-slide-smooth">
          {col1Images.map((image, index) => 
            renderImage(image, index, 'mobile-col1')
          )}
        </div>
        
        {/* Column 2 - Mobile */}
        <div className="flex flex-col gap-3 animate-slide-smooth" style={{ animationDelay: '-10s' }}>
          {col2Images.map((image, index) => 
            renderImage(image, index, 'mobile-col2')
          )}
        </div>
      </div>

      {/* Desktop: 3 columns */}
      <div className="hidden md:grid grid-cols-3 gap-4 h-full">
        {/* Column 1 - Desktop */}
        <div className="flex flex-col gap-4 animate-slide-elegant">
          {col1Images.map((image, index) => 
            renderImage(image, index, 'desktop-col1', true)
          )}
        </div>
        
        {/* Column 2 - Desktop */}
        <div className="flex flex-col gap-4 animate-slide-elegant" style={{ animationDelay: '-15s' }}>
          {col2Images.map((image, index) => 
            renderImage(image, index, 'desktop-col2', true)
          )}
        </div>
        
        {/* Column 3 - Desktop */}
        <div className="flex flex-col gap-4 animate-slide-elegant" style={{ animationDelay: '-30s' }}>
          {col3Images.map((image, index) => 
            renderImage(image, index, 'desktop-col3', true)
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroImageGrid;