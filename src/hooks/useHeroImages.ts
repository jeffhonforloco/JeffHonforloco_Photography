import { portfolioImages } from '../data/hero-images';

export const useHeroImages = () => {
  // Create optimized image arrays for different columns to prevent duplicates
  const col1Images = [...portfolioImages.slice(0, 6), ...portfolioImages.slice(0, 6)];
  const col2Images = [...portfolioImages.slice(6, 12), ...portfolioImages.slice(6, 12)];
  const col3Images = [...portfolioImages.slice(12), ...portfolioImages.slice(0, 4), ...portfolioImages.slice(12), ...portfolioImages.slice(0, 4)];

  return {
    portfolioImages,
    col1Images,
    col2Images,
    col3Images
  };
};