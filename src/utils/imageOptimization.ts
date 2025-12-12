// Image optimization utilities - works behind the scenes
// Enhanced with 4K/8K support for ultra-high resolution displays

export const generateOptimizedUrl = (src: string, width?: number, quality: number = 90): string => {
  // If it's already an external URL with params, return as-is
  if (src.includes('?') || src.startsWith('http')) {
    // For external URLs, try to optimize if possible
    if (src.startsWith('http') && !src.includes('?')) {
      const params = new URLSearchParams();
      if (width) params.set('w', width.toString());
      params.set('q', quality.toString());
      params.set('f', 'webp');
      params.set('auto', 'format');
      return `${src}?${params.toString()}`;
    }
    return src;
  }

  const params = new URLSearchParams();
  if (width) params.set('w', width.toString());
  params.set('q', quality.toString());
  params.set('f', 'webp');
  params.set('auto', 'format');
  
  return `${src}?${params.toString()}`;
};

export const generateSrcSet = (src: string, quality: number = 90, enable4K: boolean = true, enable8K: boolean = false): string => {
  const breakpoints = [320, 640, 768, 1024, 1280, 1536, 1920];
  
  // Add 4K breakpoints (2560px, 3840px)
  if (enable4K) {
    breakpoints.push(2560, 3840);
  }
  
  // Add 8K breakpoints (5120px, 7680px)
  if (enable8K) {
    breakpoints.push(5120, 7680);
  }

  return breakpoints
    .map(size => `${generateOptimizedUrl(src, size, quality)} ${size}w`)
    .join(', ');
};

export const generateSizes = (): string => {
  // Enhanced sizes for high-resolution displays
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1920px) 33vw, (max-width: 3840px) 25vw, 20vw';
};

export const generateAVIFSrcSet = (src: string, quality: number = 90, enable4K: boolean = true, enable8K: boolean = false): string => {
  const breakpoints = [320, 640, 768, 1024, 1280, 1536, 1920];
  
  if (enable4K) {
    breakpoints.push(2560, 3840);
  }
  
  if (enable8K) {
    breakpoints.push(5120, 7680);
  }

  return breakpoints
    .map(size => {
      const url = generateOptimizedUrl(src, size, quality);
      // Replace webp with avif for better compression
      return url.replace('f=webp', 'f=avif') + ` ${size}w`;
    })
    .join(', ');
};

export const preloadCriticalImages = (images: string[]): void => {
  images.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

export const isWebPSupported = (): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement('canvas');
      const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      resolve(webpSupported);
    } catch (error) {
      resolve(false);
    }
  });
};
