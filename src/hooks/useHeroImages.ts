import { portfolioImages } from '../data/hero-images';

export const useHeroImages = () => {
  // Create enough content for smooth infinite scrolling by tripling the images
  const extendedImages = [...portfolioImages, ...portfolioImages, ...portfolioImages];
  
  // Distribute across columns for better variety
  const col1Images = [...extendedImages.slice(0, Math.ceil(extendedImages.length / 3))];
  const col2Images = [...extendedImages.slice(Math.ceil(extendedImages.length / 3), Math.ceil(extendedImages.length * 2 / 3))];
  const col3Images = [...extendedImages.slice(Math.ceil(extendedImages.length * 2 / 3))];

  return {
    portfolioImages,
    col1Images,
    col2Images,
    col3Images
  };
};