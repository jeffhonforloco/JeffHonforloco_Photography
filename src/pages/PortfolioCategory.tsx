
import { useParams } from 'react-router-dom';
import { portfolioImages } from '../data/portfolio-data';
import { categoryTitles, categoryDescriptions } from '../data/category-metadata';
import { MotionItem } from '@/types/content';
import MotionPortfolio from '../components/portfolio/MotionPortfolio';
import BeautyPortfolio from '../components/portfolio/BeautyPortfolio';
import DefaultPortfolio from '../components/portfolio/DefaultPortfolio';

const PortfolioCategory = () => {
  const { category } = useParams<{ category: string }>();

  const currentCategory = category || 'luxury-fashion-photography-nyc';
  const images = portfolioImages[currentCategory as keyof typeof portfolioImages] || 
                 portfolioImages[currentCategory.split('-')[0] as keyof typeof portfolioImages] || 
                 portfolioImages.beauty;
  const title = categoryTitles[currentCategory as keyof typeof categoryTitles] || 'Portfolio';
  const description = categoryDescriptions[currentCategory as keyof typeof categoryDescriptions] || '';

  // Special layout for motion category
  if (currentCategory === 'motion') {
    const motionData = portfolioImages.motion as MotionItem[];
    return <MotionPortfolio motionData={motionData} />;
  }

  // Special layout for beauty categories
  if (currentCategory.includes('beauty')) {
    return <BeautyPortfolio images={images} />;
  }

  // Default portfolio layout
  return <DefaultPortfolio title={title} description={description} images={images} />;
};

export default PortfolioCategory;
