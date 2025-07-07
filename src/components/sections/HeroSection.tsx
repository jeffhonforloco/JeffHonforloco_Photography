
import { HeroImageGrid, HeroContent } from './hero';

const HeroSection = () => {
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

  // Create optimized image arrays for different columns to prevent duplicates
  const col1Images = [...portfolioImages.slice(0, 6), ...portfolioImages.slice(0, 6)];
  const col2Images = [...portfolioImages.slice(6, 12), ...portfolioImages.slice(6, 12)];
  const col3Images = [...portfolioImages.slice(12), ...portfolioImages.slice(0, 4), ...portfolioImages.slice(12), ...portfolioImages.slice(0, 4)];

  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      {/* Hidden SEO content */}
      <h1 className="sr-only">Jeff Honforloco Photography - Luxury Fashion & Beauty Photographer | Nationwide Bookings NYC, LA, Miami, Chicago</h1>
      
      {/* Masonry-style Grid */}
      <HeroImageGrid 
        col1Images={col1Images}
        col2Images={col2Images}
        col3Images={col3Images}
      />

      {/* Hero Content Overlay */}
      <HeroContent />
    </section>
  );
};

export default HeroSection;
