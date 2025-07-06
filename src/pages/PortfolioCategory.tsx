
import { useParams } from 'react-router-dom';
import { Play } from 'lucide-react';
import Layout from '../components/Layout';
import ImageGallery from '../components/ImageGallery';
import { MotionItem } from '@/types/content';

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
        src: 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        alt: 'Fashion Film',
        caption: 'Dynamic fashion cinematography',
        isVideo: true
      },
      {
        src: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        alt: 'Editorial Motion',
        caption: 'Storytelling through motion',
        isVideo: true
      },
      {
        src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        alt: 'Glamour Film',
        caption: 'Elegant motion portraits',
        isVideo: true
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
    beauty: 'Beauty',
    fashion: 'Fashion',
    editorial: 'Editorial',
    glamour: 'Glamour',
    lifestyle: 'Lifestyle',
    motion: 'Motion'
  };

  const categoryDescriptions = {
    beauty: 'Elegant beauty photography showcasing natural and enhanced aesthetics with sophisticated lighting and composition.',
    fashion: 'Contemporary fashion photography featuring bold styling, creative concepts, and innovative visual narratives.',
    editorial: 'Storytelling through sophisticated editorial and commercial work with artistic vision and technical excellence.',
    glamour: 'Sophisticated glamour photography with dramatic lighting, elegant styling, and captivating visual appeal.',
    lifestyle: 'Authentic lifestyle moments captured with artistic vision, showcasing real people in beautiful settings.',
    motion: 'Dynamic cinematography and motion content bringing stories to life through film and video production.'
  };

  const currentCategory = category || 'beauty';
  const images = portfolioImages[currentCategory as keyof typeof portfolioImages] || portfolioImages.beauty;
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
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={featuredVideo.src}
                      alt={featuredVideo.alt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group cursor-pointer hover:bg-black/20 transition-colors duration-500">
                      <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                        <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Mobile Collage Layout */}
          <section className="md:hidden pt-20 pb-20">
            <div className="p-1 space-y-1">
              {/* Large Featured Video at Top */}
              <div className="relative aspect-video overflow-hidden group cursor-pointer">
                <img
                  src={motionData[0]?.src}
                  alt={motionData[0]?.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-black ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>
              
              {/* 2-Column Grid Below */}
              <div className="grid grid-cols-2 gap-1">
                {/* Video 2 */}
                <div className="relative aspect-video overflow-hidden group cursor-pointer">
                  <img
                    src={motionData[1]?.src}
                    alt={motionData[1]?.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-4 h-4 text-black ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>
                
                {/* Video 3 */}
                <div className="relative aspect-video overflow-hidden group cursor-pointer">
                  <img
                    src={motionData[2]?.src}
                    alt={motionData[2]?.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-4 h-4 text-black ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>
                
                {/* Video 4 */}
                <div className="relative aspect-video overflow-hidden group cursor-pointer">
                  <img
                    src={motionData[3]?.src}
                    alt={motionData[3]?.alt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-4 h-4 text-black ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>
                
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
                    <div key={index} className="relative aspect-video overflow-hidden group cursor-pointer">
                      <img
                        src={video.src}
                        alt={video.alt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
                      
                      {/* Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                          <Play className="w-4 h-4 text-black ml-0.5" fill="currentColor" />
                        </div>
                      </div>

                      {/* MORE Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="text-white">
                          <h3 className="text-6xl font-bold opacity-80 tracking-wider">MORE</h3>
                        </div>
                      </div>
                    </div>
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
