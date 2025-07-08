import { portfolioImages } from '../data/hero-images';

export const useHeroImages = () => {
  // Use original images without duplication to avoid visual duplicates
  const images = portfolioImages;
  
  // Distribute 30 images across 3 columns (10 each for desktop)
  const col1Images = images.filter((_, index) => index % 3 === 0);
  const col2Images = images.filter((_, index) => index % 3 === 1);
  const col3Images = images.filter((_, index) => index % 3 === 2);

  return {
    portfolioImages,
    col1Images,
    col2Images,
    col3Images
  };
};