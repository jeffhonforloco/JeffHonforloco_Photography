
import { HeroSlider, HeroContent } from './hero';
import { useState } from 'react';
import { LayoutGrid, Play } from 'lucide-react';

const HeroSection = () => {
  const [viewMode, setViewMode] = useState<'slider' | 'grid'>('slider');
  
  const portfolioImages = [
    '/lovable-uploads/cd3eb066-6ffe-4e1e-9613-a1b067806092.png',
    '/lovable-uploads/060e27c9-b2d8-4f33-b575-794287894fd6.png',
    '/lovable-uploads/1bb36c8a-ad7c-469a-bc03-92b007c271c3.png',
    '/lovable-uploads/5f1a4833-8606-47d0-8677-805cd81b2558.png',
    '/lovable-uploads/c345b4c2-442d-4dc1-bf20-2c1856ad9e11.png',
    '/lovable-uploads/0987daa0-e6fd-4914-b820-b8b235e70983.png',
    '/lovable-uploads/f36a817e-cd75-4d0b-a900-ce69f01e6afb.png',
    '/lovable-uploads/1290de24-fbc4-4577-a048-fea0e3630a36.png',
    '/lovable-uploads/bcbe9d80-3fd0-494c-a9e9-a4d5ab099c02.png',
    '/lovable-uploads/13e3124a-ebf5-4084-94fa-5b85aacda039.png',
    '/lovable-uploads/04f6a5f8-91e9-4568-84ae-63cac4830a52.png',
    '/lovable-uploads/2523c649-4617-43c2-9e9e-ebf4ee328067.png',
    '/lovable-uploads/b573482f-31ab-49e5-af48-586d9aeb6909.png',
    '/lovable-uploads/be107293-394e-46fd-9fcd-d1eb5781ff56.png',
    '/lovable-uploads/7c28c520-783d-4733-ad48-9683204ef054.png',
    '/lovable-uploads/c279306c-86cb-49fe-a393-c5330888db34.png'
  ];

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Hidden SEO content */}
      <h1 className="sr-only">Jeff Honforloco Photography - Luxury Fashion & Beauty Photographer | Nationwide Bookings NYC, LA, Miami, Chicago</h1>
      
      {/* View Toggle */}
      <div className="absolute top-4 right-4 z-40 flex gap-2">
        <button
          onClick={() => setViewMode('slider')}
          className={`p-3 rounded-full transition-all duration-300 ${
            viewMode === 'slider' 
              ? 'bg-photo-red text-white' 
              : 'bg-black/50 text-white/70 hover:text-white hover:bg-black/70'
          }`}
          aria-label="Slider view"
        >
          <Play className="w-5 h-5" />
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`p-3 rounded-full transition-all duration-300 ${
            viewMode === 'grid' 
              ? 'bg-photo-red text-white' 
              : 'bg-black/50 text-white/70 hover:text-white hover:bg-black/70'
          }`}
          aria-label="Grid view"
        >
          <LayoutGrid className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Slider - Lindsay Adler Style */}
      {viewMode === 'slider' && (
        <HeroSlider images={portfolioImages} />
      )}

      {/* Mosaic Grid - Previous Style */}
      {viewMode === 'grid' && (
        <div className="absolute inset-0 p-1 md:p-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2 h-full overflow-hidden">
            {portfolioImages.slice(0, 9).map((image, index) => (
              <div key={index} className={`relative overflow-hidden ${
                index === 0 ? 'col-span-2 row-span-2' : 
                index === 4 ? 'md:col-span-1 md:row-span-2' : ''
              }`}>
                <img 
                  src={image} 
                  alt={`Jeff Honforloco Portfolio ${index + 1} - Fashion Beauty Photography`} 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
                  loading={index < 3 ? "eager" : "lazy"}
                  decoding="async"
                />
                <div className="absolute inset-0 bg-black/10 hover:bg-black/20 transition-all duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hero Content Overlay */}
      <HeroContent />
    </section>
  );
};

export default HeroSection;
