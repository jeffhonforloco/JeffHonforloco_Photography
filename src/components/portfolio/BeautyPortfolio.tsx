import { Link } from 'react-router-dom';
import Layout from '../Layout';
import LazyImage from '../common/LazyImage';

interface BeautyPortfolioProps {
  images: Array<{ src: string; alt: string; caption: string }>;
}

const BeautyPortfolio = ({ images }: BeautyPortfolioProps) => {
  return (
    <Layout>
      <div className="min-h-screen bg-black">
        {/* Back to Portfolios Link - Fixed position */}
        <div className="fixed top-24 left-4 z-10">
          <Link 
            to="/portfolios" 
            className="inline-flex items-center text-photo-red hover:text-white transition-colors duration-300 text-lg bg-black/80 backdrop-blur px-3 py-1 rounded"
          >
            <span className="mr-2">←</span>
            Back to Portfolios
          </Link>
        </div>

        {/* Title - Fixed position */}
        <div className="fixed top-0 left-0 right-0 z-10 bg-black/90 backdrop-blur pt-16 pb-4">
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-wide text-center">
            BEAUTY
          </h1>
        </div>

        {/* Full-width masonry layout - no gaps between images */}
        <div className="pt-32 columns-2 md:columns-4 gap-1 md:gap-2 space-y-1 md:space-y-2">
          {images.map((image, index) => (
            <div key={index} className="relative group overflow-hidden cursor-pointer break-inside-avoid mb-1 md:mb-2">
              <LazyImage
                src={image.src}
                alt={image.alt}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
            </div>
          ))}
        </div>

        {/* Copyright Notice - Fixed at bottom */}
        <div className="fixed bottom-4 left-0 right-0 text-center z-10">
          <p className="text-white/60 text-sm tracking-wide bg-black/80 backdrop-blur inline-block px-4 py-2 rounded">
            © 2025 Jeff Honforloco Photography. All rights reserved.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default BeautyPortfolio;