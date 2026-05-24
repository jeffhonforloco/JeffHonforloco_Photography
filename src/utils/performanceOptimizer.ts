// Performance optimization utilities

export const optimizeImageLoading = (): void => {
  const criticalImages = document.querySelectorAll('img[data-priority="true"]');
  criticalImages.forEach(img => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = (img as HTMLImageElement).src;
    document.head.appendChild(link);
  });
};

export const preloadAboveFoldImages = (): void => {
  const aboveFoldImages = document.querySelectorAll('img[data-above-fold="true"]');
  aboveFoldImages.forEach(img => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = (img as HTMLImageElement).src;
    document.head.appendChild(link);
  });
};

export const initializeImageOptimization = (): void => {
  if (typeof document === 'undefined' || !document.body) return;
  try {
    optimizeImageLoading();
    preloadAboveFoldImages();
  } catch {
    // silent — non-critical
  }
};
