// Performance optimization utilities - works behind the scenes

export const optimizeImageLoading = (): void => {
  // Preload critical images
  const criticalImages = document.querySelectorAll('img[data-priority="true"]');
  criticalImages.forEach(img => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = img.src;
    document.head.appendChild(link);
  });
};

export const setupLazyLoading = (): void => {
  const images = document.querySelectorAll('img[data-src]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px',
    threshold: 0.1
  });

  images.forEach(img => observer.observe(img));
};

export const optimizeImageFormats = (): void => {
  try {
    // Check WebP support and optimize images
    const canvas = document.createElement('canvas');
    const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    
    if (webpSupported) {
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        try {
          if (!img.src.includes('webp') && !img.src.includes('?') && img.src.startsWith('http')) {
            // Add WebP optimization parameters
            const url = new URL(img.src);
            url.searchParams.set('f', 'webp');
            url.searchParams.set('q', '75');
            url.searchParams.set('auto', 'format');
            img.src = url.toString();
          }
        } catch (urlError) {
          // Skip images that can't be processed
        }
      });
    }
  } catch (error) {
    // Silently handle WebP optimization errors
  }
};

export const preloadAboveFoldImages = (): void => {
  // Preload images that are likely to be above the fold
  const aboveFoldImages = document.querySelectorAll('img[data-above-fold="true"]');
  aboveFoldImages.forEach(img => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = img.src;
    document.head.appendChild(link);
  });
};

export const optimizeImageSizes = (): void => {
  // Add responsive image attributes
  const images = document.querySelectorAll('img:not([srcset])');
  images.forEach(img => {
    if (!img.src.includes('?')) {
      const src = img.src;
      const srcSet = generateResponsiveSrcSet(src);
      img.srcSet = srcSet;
      img.sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    }
  });
};

const generateResponsiveSrcSet = (src: string): string => {
  const breakpoints = [320, 640, 768, 1024, 1280, 1536, 1920];
  return breakpoints
    .map(size => {
      const url = new URL(src);
      url.searchParams.set('w', size.toString());
      url.searchParams.set('q', '75');
      url.searchParams.set('f', 'webp');
      url.searchParams.set('auto', 'format');
      return `${url.toString()} ${size}w`;
    })
    .join(', ');
};

export const initializeImageOptimization = (): void => {
  // Check if DOM is ready
  if (typeof document === 'undefined' || !document.body) {
    return;
  }

  // Run all optimizations with error handling
  try {
    optimizeImageLoading();
    setupLazyLoading();
    optimizeImageFormats();
    preloadAboveFoldImages();
    optimizeImageSizes();
  } catch (error) {
    console.warn('Image optimization failed:', error);
  }
};
