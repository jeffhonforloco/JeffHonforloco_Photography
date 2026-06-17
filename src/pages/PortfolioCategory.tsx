
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { portfolioImages as staticPortfolioImages } from '../data/portfolio-data';
import { categoryTitles, categoryDescriptions } from '../data/category-metadata';
import { MotionItem } from '@/types/content';
import MotionPortfolio from '../components/portfolio/MotionPortfolio';
import BeautyPortfolio from '../components/portfolio/BeautyPortfolio';
import DefaultPortfolio from '../components/portfolio/DefaultPortfolio';

type StaticImage = { src: string; alt: string; caption: string };

interface ApiImage {
  id: number;
  title: string;
  description: string;
  image_url: string;
  category: string;
  is_featured: boolean;
  sort_order: number;
  metadata: string;
}

const toStaticImage = (img: ApiImage): StaticImage => ({
  src: img.image_url,
  alt: img.title,
  caption: img.description || '',
});

const toMotionItem = (img: ApiImage): MotionItem => {
  let meta: Partial<MotionItem> = {};
  try {
    if (img.metadata) meta = JSON.parse(img.metadata);
  } catch { /* ignore invalid metadata */ }
  return {
    src: img.image_url,
    alt: img.title,
    caption: img.description || '',
    isVideo: true,
    ...meta,
  };
};

const PortfolioCategory = () => {
  const { category } = useParams<{ category: string }>();
  const currentCategory = category || 'luxury-fashion-photography-nyc';

  const [apiImages, setApiImages] = useState<StaticImage[] | null>(null);
  const [apiMotion, setApiMotion] = useState<MotionItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await fetch(`/api/v1/portfolio/category/${currentCategory}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data?.images) && data.data.images.length > 0) {
          if (currentCategory === 'motion') {
            setApiMotion((data.data.images as ApiImage[]).map(toMotionItem));
          } else {
            setApiImages((data.data.images as ApiImage[]).map(toStaticImage));
          }
        }
      } catch {
        // fall through to static data
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [currentCategory]);

  const staticImages =
    (staticPortfolioImages[currentCategory as keyof typeof staticPortfolioImages] as StaticImage[]) ||
    (staticPortfolioImages[currentCategory.split('-')[0] as keyof typeof staticPortfolioImages] as StaticImage[]) ||
    (currentCategory.includes('beauty') ? staticPortfolioImages.beauty as StaticImage[] : []);

  const images = apiImages ?? staticImages;
  const title = categoryTitles[currentCategory as keyof typeof categoryTitles] || 'Portfolio';
  const description = categoryDescriptions[currentCategory as keyof typeof categoryDescriptions] || '';

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (currentCategory === 'motion') {
    const motionData = apiMotion ?? (staticPortfolioImages.motion as MotionItem[]);
    return <MotionPortfolio motionData={motionData} />;
  }

  if (currentCategory.includes('beauty')) {
    return <BeautyPortfolio images={images} />;
  }

  return <DefaultPortfolio title={title} description={description} images={images} />;
};

export default PortfolioCategory;
