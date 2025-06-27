
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import ImageGallery from '../components/ImageGallery';

const PortfolioCategory = () => {
  const { category } = useParams<{ category: string }>();

  // Sample images for each category
  const portfolioImages = {
    beauty: [
      {
        src: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        alt: 'Beauty Portrait 1',
        caption: 'Natural beauty with soft lighting'
      },
      {
        src: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        alt: 'Beauty Portrait 2',
        caption: 'Contemporary beauty photography'
      },
      {
        src: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        alt: 'Beauty Portrait 3',
        caption: 'Artistic beauty composition'
      },
      {
        src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        alt: 'Beauty Portrait 4',
        caption: 'Dramatic beauty lighting'
      },
      {
        src: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        alt: 'Beauty Portrait 5',
        caption: 'Editorial beauty style'
      },
      {
        src: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        alt: 'Beauty Portrait 6',
        caption: 'Minimalist beauty approach'
      }
    ],
    fashion: [
      {
        src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        alt: 'Fashion Portrait 1',
        caption: 'High fashion editorial'
      },
      {
        src: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        alt: 'Fashion Portrait 2',
        caption: 'Contemporary fashion styling'
      },
      {
        src: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        alt: 'Fashion Portrait 3',
        caption: 'Street fashion photography'
      },
      {
        src: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        alt: 'Fashion Portrait 4',
        caption: 'Avant-garde fashion concept'
      }
    ]
  };

  const categoryTitles = {
    beauty: 'Beauty',
    fashion: 'Fashion',
    editorial: 'Editorial',
    glamour: 'Glamour',
    lifestyle: 'Lifestyle'
  };

  const categoryDescriptions = {
    beauty: 'Elegant beauty photography showcasing natural and enhanced aesthetics with sophisticated lighting and composition.',
    fashion: 'Contemporary fashion photography featuring bold styling, creative concepts, and innovative visual narratives.',
    editorial: 'Storytelling through sophisticated editorial and commercial work with artistic vision and technical excellence.',
    glamour: 'Sophisticated glamour photography with dramatic lighting, elegant styling, and captivating visual appeal.',
    lifestyle: 'Authentic lifestyle moments captured with artistic vision, showcasing real people in beautiful settings.'
  };

  const currentCategory = category || 'beauty';
  const images = portfolioImages[currentCategory as keyof typeof portfolioImages] || portfolioImages.beauty;
  const title = categoryTitles[currentCategory as keyof typeof categoryTitles] || 'Portfolio';
  const description = categoryDescriptions[currentCategory as keyof typeof categoryDescriptions] || '';

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 section-padding">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">{title}</h1>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Image Gallery */}
        <ImageGallery images={images} className="animate-scale-in" />
      </section>
    </Layout>
  );
};

export default PortfolioCategory;
