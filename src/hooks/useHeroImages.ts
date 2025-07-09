import { portfolioImages } from '../data/hero-images';

export const useHeroImages = () => {
  // Double images for seamless 50% movement animation
  const doubleImages = [...portfolioImages, ...portfolioImages];
  
  // Distribute across 3 columns for seamless coverage
  const col1Images = doubleImages.filter((_, index) => index % 3 === 0);
  const col2Images = doubleImages.filter((_, index) => index % 3 === 1);
  const col3Images = doubleImages.filter((_, index) => index % 3 === 2);

  return {
    portfolioImages,
    col1Images,
    col2Images,
    col3Images
  };
};