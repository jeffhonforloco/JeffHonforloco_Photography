
import { useState, useEffect } from 'react';

const HeroSection = () => {
  const [contentData, setContentData] = useState<any>(null);

  useEffect(() => {
    fetch('/data/jeff-content.json')
      .then(response => response.json())
      .then(data => setContentData(data))
      .catch(error => console.error('Error loading content:', error));
  }, []);

  if (!contentData) {
    return <div className="min-h-screen bg-black"></div>;
  }

  const portfolioImages = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506629905963-b3b17f54e5b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1619895862022-09114b41f16f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  ];

  return (
    <section className="relative min-h-screen bg-black overflow-hidden">
      {/* Animated Image Grid */}
      <div className="absolute inset-0">
        <div className="grid grid-cols-12 grid-rows-8 h-full gap-1">
          {/* Row 1 */}
          <div className="col-span-3 row-span-4 relative overflow-hidden">
            <img
              src={portfolioImages[0]}
              alt="Fashion Portrait"
              className="w-full h-full object-cover animate-slide-up"
              style={{ animationDelay: '0s', animationDuration: '20s' }}
              onError={(e) => {
                console.log('Image failed to load:', portfolioImages[0]);
                e.currentTarget.style.backgroundColor = '#333';
              }}
            />
          </div>
          <div className="col-span-6 row-span-3 relative overflow-hidden">
            <img
              src={portfolioImages[1]}
              alt="Beauty Portrait"
              className="w-full h-full object-cover animate-slide-up"
              style={{ animationDelay: '2s', animationDuration: '18s' }}
              onError={(e) => {
                console.log('Image failed to load:', portfolioImages[1]);
                e.currentTarget.style.backgroundColor = '#333';
              }}
            />
          </div>
          <div className="col-span-3 row-span-4 relative overflow-hidden">
            <img
              src={portfolioImages[2]}
              alt="Editorial Portrait"
              className="w-full h-full object-cover animate-slide-up"
              style={{ animationDelay: '1s', animationDuration: '22s' }}
              onError={(e) => {
                console.log('Image failed to load:', portfolioImages[2]);
                e.currentTarget.style.backgroundColor = '#333';
              }}
            />
          </div>

          {/* Row 2 */}
          <div className="col-span-4 row-span-3 relative overflow-hidden">
            <img
              src={portfolioImages[3]}
              alt="Glamour Portrait"
              className="w-full h-full object-cover animate-slide-up"
              style={{ animationDelay: '3s', animationDuration: '16s' }}
              onError={(e) => {
                console.log('Image failed to load:', portfolioImages[3]);
                e.currentTarget.style.backgroundColor = '#333';
              }}
            />
          </div>
          <div className="col-span-2 row-span-2 relative overflow-hidden">
            <img
              src={portfolioImages[4]}
              alt="Fashion Model"
              className="w-full h-full object-cover animate-slide-up"
              style={{ animationDelay: '4s', animationDuration: '19s' }}
              onError={(e) => {
                console.log('Image failed to load:', portfolioImages[4]);
                e.currentTarget.style.backgroundColor = '#333';
              }}
            />
          </div>
          <div className="col-span-3 row-span-3 relative overflow-hidden">
            <img
              src={portfolioImages[5]}
              alt="Portrait Photography"
              className="w-full h-full object-cover animate-slide-up"
              style={{ animationDelay: '1.5s', animationDuration: '21s' }}
              onError={(e) => {
                console.log('Image failed to load:', portfolioImages[5]);
                e.currentTarget.style.backgroundColor = '#333';
              }}
            />
          </div>

          {/* Row 3 */}
          <div className="col-span-3 row-span-2 relative overflow-hidden">
            <img
              src={portfolioImages[6]}
              alt="Beauty Shot"
              className="w-full h-full object-cover animate-slide-up"
              style={{ animationDelay: '2.5s', animationDuration: '17s' }}
              onError={(e) => {
                console.log('Image failed to load:', portfolioImages[6]);
                e.currentTarget.style.backgroundColor = '#333';
              }}
            />
          </div>
          <div className="col-span-4 row-span-1 relative overflow-hidden">
            <img
              src={portfolioImages[7]}
              alt="Fashion Editorial"
              className="w-full h-full object-cover animate-slide-up"
              style={{ animationDelay: '3.5s', animationDuration: '20s' }}
              onError={(e) => {
                console.log('Image failed to load:', portfolioImages[7]);
                e.currentTarget.style.backgroundColor = '#333';
              }}
            />
          </div>
          <div className="col-span-2 row-span-3 relative overflow-hidden">
            <img
              src={portfolioImages[8]}
              alt="Lifestyle Portrait"
              className="w-full h-full object-cover animate-slide-up"
              style={{ animationDelay: '0.5s', animationDuration: '23s' }}
              onError={(e) => {
                console.log('Image failed to load:', portfolioImages[8]);
                e.currentTarget.style.backgroundColor = '#333';
              }}
            />
          </div>

          {/* Bottom row */}
          <div className="col-span-6 row-span-2 relative overflow-hidden">
            <img
              src={portfolioImages[9]}
              alt="Professional Portrait"
              className="w-full h-full object-cover animate-slide-up"
              style={{ animationDelay: '4.5s', animationDuration: '15s' }}
              onError={(e) => {
                console.log('Image failed to load:', portfolioImages[9]);
                e.currentTarget.style.backgroundColor = '#333';
              }}
            />
          </div>
        </div>
      </div>

      {/* Centered Name Overlay */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="text-center">
          <h1 className="font-playfair text-white text-8xl md:text-9xl lg:text-[10rem] xl:text-[12rem] font-light tracking-[0.1em] leading-[0.8] drop-shadow-2xl">
            JEFF
          </h1>
          <div className="w-24 h-px bg-white mx-auto my-4"></div>
          <h2 className="font-playfair text-white text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.3em] drop-shadow-lg">
            HONFORLOCO
          </h2>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
