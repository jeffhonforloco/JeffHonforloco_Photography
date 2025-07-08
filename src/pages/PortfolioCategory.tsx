
import { useParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import Layout from '../components/Layout';
import ImageGallery from '../components/ImageGallery';
import { MotionItem } from '@/types/content';
import VideoPlayer from '@/components/VideoPlayer';

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
    ],
    motion: [
      {
        src: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
        alt: 'Beauty Motion Film',
        caption: 'Cinematic beauty in motion',
        isVideo: true,
        featured: true
      },
      {
        src: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        alt: 'Sample YouTube Video',
        caption: 'YouTube Integration Example',
        isVideo: true,
        isYouTube: true,
        youTubeId: 'dQw4w9WgXcQ'
      },
      {
        src: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        alt: 'Editorial Motion',
        caption: 'Storytelling through motion',
        isVideo: true
      },
      {
        src: 'https://youtu.be/ScMzIvxBSi4',
        alt: 'Another YouTube Sample',
        caption: 'YouTube Short Link Example',
        isVideo: true,
        isYouTube: true,
        youTubeId: 'ScMzIvxBSi4'
      },
      {
        src: 'https://images.unsplash.com/photo-1574391884720-bbc0b76bffdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        alt: 'Lifestyle Motion',
        caption: 'Authentic moments in motion',
        isVideo: true
      },
      {
        src: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        alt: 'Commercial Film',
        caption: 'Professional motion content',
        isVideo: true
      }
    ]
  };

  const categoryTitles = {
    'luxury-fashion-photography-nyc': 'Luxury Fashion Photography',
    'luxury-beauty-photography-nationwide': 'Luxury Beauty Photography',
    'editorial-photography-magazines': 'Editorial Photography',
    'celebrity-lifestyle-photography': 'Celebrity & Lifestyle Photography',
    // Legacy support
    beauty: 'Beauty Photography',
    fashion: 'Fashion Photography',
    editorial: 'Editorial Photography',
    glamour: 'Glamour Photography',
    lifestyle: 'Lifestyle Photography',
    motion: 'Motion & Video'
  };

  const categoryDescriptions = {
    'luxury-fashion-photography-nyc': 'High-end fashion photography for luxury brands, fashion weeks, and celebrity campaigns. Available nationwide with specialization in NYC, LA, Miami, and major fashion capitals.',
    'luxury-beauty-photography-nationwide': 'Premium beauty and cosmetic photography for luxury brands, featuring sophisticated lighting and flawless execution. Serving high-end beauty brands coast to coast.',
    'editorial-photography-magazines': 'Magazine-quality editorial photography for publications, brands, and storytelling campaigns. Creating compelling narratives that captivate audiences and drive engagement.',
    'celebrity-lifestyle-photography': 'Exclusive celebrity and luxury lifestyle photography capturing authentic moments with sophisticated aesthetics. Trusted by high-profile clients and entertainment industry professionals.',
    // Legacy descriptions
    beauty: 'Elegant beauty photography showcasing natural and enhanced aesthetics with sophisticated lighting and composition.',
    fashion: 'Contemporary fashion photography featuring bold styling, creative concepts, and innovative visual narratives.',
    editorial: 'Storytelling through sophisticated editorial and commercial work with artistic vision and technical excellence.',
    glamour: 'Sophisticated glamour photography with dramatic lighting, elegant styling, and captivating visual appeal.',
    lifestyle: 'Authentic lifestyle moments captured with artistic vision, showcasing real people in beautiful settings.',
    motion: 'Dynamic cinematography and motion content bringing stories to life through film and video production.'
  };

  const currentCategory = category || 'luxury-fashion-photography-nyc';
  const images = portfolioImages[currentCategory as keyof typeof portfolioImages] || 
                 portfolioImages[currentCategory.split('-')[0] as keyof typeof portfolioImages] || 
                 portfolioImages.beauty;
  const title = categoryTitles[currentCategory as keyof typeof categoryTitles] || 'Portfolio';
  const description = categoryDescriptions[currentCategory as keyof typeof categoryDescriptions] || '';

  // Special layout for motion category
  if (currentCategory === 'motion') {
    const motionData = portfolioImages.motion as MotionItem[];
    const featuredVideo = motionData.find(video => video.featured);
    const otherVideos = motionData.filter(video => !video.featured);

    return (
      <Layout>
        <div className="min-h-screen bg-black">
          {/* Featured Video - Only on Desktop */}
          <section className="hidden md:block pt-32 pb-8">
            {featuredVideo && (
              <div className="px-8">
                <div className="max-w-7xl mx-auto">
                  <VideoPlayer video={featuredVideo} />
                </div>
              </div>
            )}
          </section>

          {/* Mobile Collage Layout */}
          <section className="md:hidden pt-20 pb-20">
            <div className="p-1 space-y-1">
              {/* Large Featured Video at Top */}
              <VideoPlayer video={motionData[0]} className="group cursor-pointer" />
              
              {/* 2-Column Grid Below */}
              <div className="grid grid-cols-2 gap-1">
                {/* Video 2 */}
                <VideoPlayer video={motionData[1]} className="group cursor-pointer" />
                
                {/* Video 3 */}
                <VideoPlayer video={motionData[2]} className="group cursor-pointer" />
                
                {/* Video 4 */}
                <VideoPlayer video={motionData[3]} className="group cursor-pointer" />
                
                {/* Video 5 with MORE overlay */}
                <div className="relative aspect-video overflow-hidden group cursor-pointer">
                  <img
                    src={motionData[4]?.src}
                    alt={motionData[4]?.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-teal-500/80 group-hover:bg-teal-500/60 transition-colors duration-500"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <h3 className="text-white text-3xl font-bold tracking-wider">MORE</h3>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Desktop Motion Grid */}
          <section className="hidden md:block pb-20">
            <div className="px-8">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {otherVideos.map((video, index) => (
                    <VideoPlayer key={index} video={video} className="group cursor-pointer" />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Copyright Notice */}
          <section className="pb-8">
            <div className="px-8">
              <div className="max-w-7xl mx-auto text-center">
                <p className="text-gray-500 text-sm">
                  © 2025 Jeff Honforloco Photography. All rights reserved.
                </p>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* SEO Header Section - Hidden for beauty category */}
      {!currentCategory.includes('beauty') && (
        <section className="pt-32 pb-12 bg-black">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6 tracking-wide">
              {title}
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed mb-8">
              {description}
            </p>
            <div className="w-32 h-px bg-gradient-to-r from-transparent via-photo-red to-transparent mx-auto"></div>
          </div>
        </section>
      )}

      {/* Portfolio Gallery Section */}
      <section className={`${currentCategory.includes('beauty') ? 'pt-20' : 'py-12'} section-padding`}>
        <div className="max-w-7xl mx-auto">
          {/* Image Gallery */}
          <ImageGallery images={images} className="animate-scale-in" />
        </div>
      </section>
    </Layout>
  );
};

export default PortfolioCategory;
