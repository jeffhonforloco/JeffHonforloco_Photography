import { portfolioImages } from '../data/hero-images';

export const useHeroImages = () => {
  // Duplicate images for seamless infinite scrolling
  const duplicatedImages = [...portfolioImages, ...portfolioImages];
  
  // Distribute all images across columns for better variety
  const col1Images = [...duplicatedImages.slice(0, Math.ceil(duplicatedImages.length / 3))];
  const col2Images = [...duplicatedImages.slice(Math.ceil(duplicatedImages.length / 3), Math.ceil(duplicatedImages.length * 2 / 3))];
  const col3Images = [...duplicatedImages.slice(Math.ceil(duplicatedImages.length * 2 / 3))];

  return {
    portfolioImages,
    col1Images,
    col2Images,
    col3Images
  };
};