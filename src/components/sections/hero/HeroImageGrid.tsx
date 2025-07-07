import { useHeroImages } from '../../../hooks/useHeroImages';
import { useRef, useEffect, useCallback } from 'react';

const HeroImageGrid = () => {
  const { portfolioImages, col1Images, col2Images, col3Images } = useHeroImages();
  const loadedImagesRef = useRef<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Single shared intersection observer for better performance
  const setupLazyLoading = useCallback(() => {
    if (observerRef.current) observerRef.current.disconnect();
    
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src && !loadedImagesRef.current.has(img.dataset.src)) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            loadedImagesRef.current.add(img.src);
            observerRef.current?.unobserve(img);
          }
        }
      });
    }, { 
      rootMargin: '100px',
      threshold: 0.1
    });
  }, []);

  // Optimized image preloading
  useEffect(() => {
    // Preload only first 3 critical images
    const criticalImages = portfolioImages.slice(0, 3);
    criticalImages.forEach((src) => {
      const img = new Image();
      img.onload = () => loadedImagesRef.current.add(src);
      img.src = src;
    });

    setupLazyLoading();
    
    return () => {
      observerRef.current?.disconnect();
    };
  }, [portfolioImages, setupLazyLoading]);

  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (node && observerRef.current) {
      observerRef.current.observe(node);
    }
  }, []);

  const renderImage = (image: string, index: number, columnPrefix: string) => {
    const isCritical = index < 3;
    const isLoaded = loadedImagesRef.current.has(image);
    
    return (
      <div 
        key={`${columnPrefix}-${index}`} 
        className="relative overflow-hidden flex-shrink-0 hero-image-container"
      >
        <img 
          ref={!isCritical ? imgRef : undefined}
          src={isCritical ? image : undefined}
          data-src={!isCritical ? image : undefined}
          alt={`Portfolio ${(index % portfolioImages.length) + 1}`} 
          className={`hero-image w-full h-auto object-cover ${isLoaded || isCritical ? 'opacity-100' : 'opacity-20'}`}
          loading={isCritical ? "eager" : "lazy"}
          decoding="async"
          width="400"
          height="600"
        />
        {(!isLoaded && !isCritical) && (
          <div className="absolute inset-0 bg-gradient-to-b from-muted/50 to-muted animate-pulse" />
        )}
      </div>
    );
  };

  return (
    <div className="absolute inset-0 p-2 md:p-3">
      {/* Mobile: 2 columns */}
      <div className="md:hidden grid grid-cols-2 gap-3 h-full">
        <div className="flex flex-col gap-3 animate-slide-optimized">
          {col1Images.map((image, index) => 
            renderImage(image, index, 'mobile-col1')
          )}
        </div>
        
        <div className="flex flex-col gap-3 animate-slide-optimized" style={{ animationDelay: '-15s' }}>
          {col2Images.map((image, index) => 
            renderImage(image, index, 'mobile-col2')
          )}
        </div>
      </div>

      {/* Desktop: 3 columns */}
      <div className="hidden md:grid grid-cols-3 gap-4 h-full">
        <div className="flex flex-col gap-4 animate-slide-optimized">
          {col1Images.map((image, index) => 
            renderImage(image, index, 'desktop-col1')
          )}
        </div>
        
        <div className="flex flex-col gap-4 animate-slide-optimized" style={{ animationDelay: '-20s' }}>
          {col2Images.map((image, index) => 
            renderImage(image, index, 'desktop-col2')
          )}
        </div>
        
        <div className="flex flex-col gap-4 animate-slide-optimized" style={{ animationDelay: '-40s' }}>
          {col3Images.map((image, index) => 
            renderImage(image, index, 'desktop-col3')
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroImageGrid;