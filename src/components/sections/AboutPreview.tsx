
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ContentData } from '@/types/content';

const AboutPreview = () => {
  const [contentData, setContentData] = useState<ContentData | null>(null);

  useEffect(() => {
    fetch('/data/jeff-content.json')
      .then(response => response.json())
      .then(data => setContentData(data))
      .catch(error => console.error('Error loading content:', error));
  }, []);

  if (!contentData) {
    return <div className="py-40 md:py-48 bg-photo-black"></div>;
  }

  return (
    <section className="py-40 md:py-48 bg-photo-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-photo-gray-900/30 to-photo-black"></div>
      
      <div className="relative max-w-8xl mx-auto px-8 md:px-16">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div>
            <h2 className="font-playfair text-6xl md:text-7xl lg:text-8xl font-extralight tracking-wide text-white mb-12 leading-[0.9]">
              About Jeff
            </h2>
            <div className="w-32 h-px bg-gradient-to-r from-photo-red to-transparent mb-16"></div>
            
            <div className="space-y-6 font-light text-xl md:text-2xl text-gray-300 leading-relaxed mb-16 tracking-wide">
              <p>
                A visionary photographer and creative entrepreneur based in the United States, renowned for his captivating imagery and client-first approach. With years of hands-on experience in fashion, beauty, and lifestyle photography, Jeff has become a trusted name in the industry—recognized for delivering high-quality, emotionally compelling visuals that consistently leave clients amazed.
              </p>
              
              <p>
                Passionate about highlighting the glamour, strength, and individuality of every subject, Jeff's work has graced top fashion shows in Providence, Rhode Island, where he currently resides and operates. His artistic eye and attention to detail make him a go-to photographer for models, brands, agencies, and individuals seeking to tell their story through powerful visuals.
              </p>
              
              <p>
                Specializing in fashion, beauty, editorial, lifestyle, and portrait photography, Jeff takes pride in understanding his clients' vision and turning it into timeless art. His clients not only value his technical skill but also his warm energy, professionalism, and commitment to excellence.
              </p>
              
              <p>
                Whether in front of the lens or behind it, Jeff is dedicated to creating meaningful moments. He believes, "A well-captured image represents a moment in time that lives on forever."
              </p>
            </div>
            
            <Link 
              to="/about" 
              className="group inline-flex items-center font-medium text-white tracking-[0.2em] uppercase text-sm hover:text-photo-red transition-colors duration-500"
            >
              Discover More
              <span className="ml-6 w-16 h-px bg-photo-red transition-all duration-500 group-hover:w-20"></span>
            </Link>
          </div>
          
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Jeff Honforloco"
                className="w-full h-full object-cover hover:scale-105 transition-all duration-1000"
              />
            </div>
            <div className="absolute -bottom-12 -right-12 w-40 h-40 border border-photo-red/30"></div>
            <div className="absolute -top-12 -left-12 w-32 h-32 border border-photo-red/50"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
