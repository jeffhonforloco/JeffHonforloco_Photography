import { Link } from 'react-router-dom';
import Layout from '../Layout';

interface BeautyPortfolioProps {
  images: Array<{ src: string; alt: string; caption: string }>;
}

const BeautyPortfolio = ({ images }: BeautyPortfolioProps) => {
  return (
    <Layout>
      <div className="min-h-screen bg-black pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Back to Portfolios Link */}
          <div className="mb-8">
            <Link 
              to="/portfolio" 
              className="inline-flex items-center text-photo-red hover:text-white transition-colors duration-300 text-lg"
            >
              <span className="mr-2">←</span>
              Back to Portfolios
            </Link>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-wide">
              BEAUTY
            </h1>
          </div>

          {/* Image Grid - Large varied sizes like Lindsay Adler glamour page */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {images.map((image, index) => {
              // Create larger, more varied sizing patterns
              const getSizeClass = (index: number) => {
                const patterns = [
                  'col-span-1 row-span-1', // Normal size
                  'col-span-1 row-span-1', // Normal size  
                  'md:col-span-1 md:row-span-2', // Tall
                  'md:col-span-1 md:row-span-1', // Normal
                  'md:col-span-2 md:row-span-1', // Wide
                  'col-span-1 row-span-1', // Normal
                  'md:col-span-1 md:row-span-1', // Normal
                  'md:col-span-1 md:row-span-1', // Normal
                ];
                return patterns[index % patterns.length] || 'col-span-1 row-span-1';
              };
              
              return (
                <div key={index} className={`relative group overflow-hidden cursor-pointer ${getSizeClass(index)}`}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover min-h-[200px] md:min-h-[300px] transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
                </div>
              );
            })}
          </div>

          {/* Copyright Notice */}
          <div className="text-center mt-16 pt-8">
            <p className="text-white/60 text-sm tracking-wide">
              © 2025 Jeff Honforloco Photography. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BeautyPortfolio;