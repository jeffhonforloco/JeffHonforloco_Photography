
import { useState, useEffect } from 'react';
import { ContentData } from '@/types/content';

const Recognition = () => {
  const [contentData, setContentData] = useState<ContentData | null>(null);

  useEffect(() => {
    fetch('/data/jeff-content.json')
      .then(response => response.json())
      .then(data => setContentData(data))
      .catch(error => console.error('Error loading content:', error));
  }, []);

  if (!contentData) {
    return <div className="py-40 md:py-48 bg-photo-gray-900"></div>;
  }

  return (
    <section className="py-40 md:py-48 bg-photo-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-photo-black/20 to-photo-gray-900"></div>
      
      <div className="relative max-w-8xl mx-auto px-8 md:px-16 text-center">
        <h2 className="font-playfair text-6xl md:text-7xl lg:text-8xl font-extralight tracking-wide text-white mb-24 leading-[0.9]">
          Recognition
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
          <div className="text-center">
            <div className="text-photo-red font-playfair text-5xl md:text-6xl lg:text-7xl font-extralight mb-6">
              {contentData.experience.publishedWorks}
            </div>
            <p className="font-light text-lg md:text-xl text-gray-300 tracking-[0.1em] uppercase">Published Works</p>
          </div>
          <div className="text-center">
            <div className="text-photo-red font-playfair text-5xl md:text-6xl lg:text-7xl font-extralight mb-6">
              {contentData.experience.years}
            </div>
            <p className="font-light text-lg md:text-xl text-gray-300 tracking-[0.1em] uppercase">Years Experience</p>
          </div>
          <div className="text-center">
            <div className="text-photo-red font-playfair text-5xl md:text-6xl lg:text-7xl font-extralight mb-6">
              {contentData.experience.happyClients}
            </div>
            <p className="font-light text-lg md:text-xl text-gray-300 tracking-[0.1em] uppercase">Happy Clients</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Recognition;
