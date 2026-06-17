import { useState, useEffect } from 'react';
import { portfolioImages as staticPortfolioImages } from '../data/hero-images';

export const useHeroImages = () => {
  const [portfolioImages, setPortfolioImages] = useState<string[]>(staticPortfolioImages);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch('/api/v1/settings/hero_images');
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          setPortfolioImages(data.data);
        }
      } catch { /* use static fallback */ }
    };
    fetchImages();
  }, []);

  // Double images for seamless -50% loop: at -50% the visible content is
  // identical to the 0% position, making the reset invisible.
  const doubleImages = [...portfolioImages, ...portfolioImages];

  const col1Images = doubleImages.filter((_, index) => index % 3 === 0);
  const col2Images = doubleImages.filter((_, index) => index % 3 === 1);
  const col3Images = doubleImages.filter((_, index) => index % 3 === 2);

  return {
    portfolioImages,
    col1Images,
    col2Images,
    col3Images,
  };
};
