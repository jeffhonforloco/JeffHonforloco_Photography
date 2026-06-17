
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
                Award-winning fashion and beauty photographer available nationwide for leading brands, celebrities, and models. With over 15 years of experience, Jeff has established himself as a premier choice for editorial photography across New York City, Los Angeles, Miami, Chicago, and Atlanta.
              </p>

              <p>
                Specializing in high-end fashion photography, celebrity beauty campaigns, and editorial shoots, Jeff's work has graced fashion weeks and brand campaigns worldwide. His artistic vision and commitment to excellence make him the go-to photographer for clients seeking sophisticated, world-class imagery.
              </p>

              <p>
                From fashion week in NYC to celebrity campaigns in LA, beauty shoots in Miami to editorial work in Chicago, Jeff delivers consistently exceptional results. His clientele includes top models, leading brands, and entertainment industry professionals who trust his expertise for their most important campaigns.
              </p>
              
              <p>
                "A well-captured image represents a moment in time that is expressed infinitely" - This philosophy drives every session, ensuring each client receives photography that exceeds expectations and delivers lasting impact.
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
                src="/images/be7f5d35-71c0-4752-8fbe-46cd1a9e1fdd.png"
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
