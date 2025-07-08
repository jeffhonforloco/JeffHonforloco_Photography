import { portfolioImages } from '../data/hero-images';

export const useHeroImages = () => {
  // Triple images to eliminate dark gaps completely
  const tripleImages = [...portfolioImages, ...portfolioImages, ...portfolioImages];
  
  // Distribute across 3 columns for seamless coverage
  const col1Images = tripleImages.filter((_, index) => index % 3 === 0);
  const col2Images = tripleImages.filter((_, index) => index % 3 === 1);
  const col3Images = tripleImages.filter((_, index) => index % 3 === 2);

  return {
    portfolioImages,
    col1Images,
    col2Images,
    col3Images
  };
};