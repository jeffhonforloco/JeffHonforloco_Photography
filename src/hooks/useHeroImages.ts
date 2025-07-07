import { portfolioImages } from '../data/hero-images';

export const useHeroImages = () => {
  // Reduce duplicates for better performance - only double the arrays instead of more
  const col1Images = [...portfolioImages.slice(0, 8)];
  const col2Images = [...portfolioImages.slice(8, 16)];
  const col3Images = [...portfolioImages.slice(0, 8)];

  return {
    portfolioImages,
    col1Images,
    col2Images,
    col3Images
  };
};