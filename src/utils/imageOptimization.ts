export const generateOptimizedUrl = (src: string, width?: number, quality: number = 80): string => {
  if (src.includes('?') || src.startsWith('http')) {
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

// 5 practical breakpoints — covers all real viewports without bloating srcset attributes.
// 4K entries are opt-in for when a CDN is wired up.
const BASE_BREAKPOINTS = [400, 800, 1200, 1600, 1920];
const BREAKPOINTS_4K = [...BASE_BREAKPOINTS, 2560, 3840];

export const generateSrcSet = (
  src: string,
  quality: number = 80,
  enable4K: boolean = false,
  _enable8K: boolean = false
): string => {
  const breakpoints = enable4K ? BREAKPOINTS_4K : BASE_BREAKPOINTS;
  return breakpoints
    .map(size => `${generateOptimizedUrl(src, size, quality)} ${size}w`)
    .join(', ');
};

export const generateSizes = (): string => {
  return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
};

export const generateAVIFSrcSet = (
  src: string,
  quality: number = 80,
  enable4K: boolean = false,
  _enable8K: boolean = false
): string => {
  const breakpoints = enable4K ? BREAKPOINTS_4K : BASE_BREAKPOINTS;
  return breakpoints
    .map(size => {
      const url = generateOptimizedUrl(src, size, quality);
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
      resolve(canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0);
    } catch {
      resolve(false);
    }
  });
};
