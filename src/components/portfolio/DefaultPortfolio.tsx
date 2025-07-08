import { Link } from 'react-router-dom';
import Layout from '../Layout';

interface DefaultPortfolioProps {
  title: string;
  description: string;
  images: Array<{ src: string; alt: string; caption: string }>;
}

const DefaultPortfolio = ({ title, description, images }: DefaultPortfolioProps) => {
  return (
    <Layout>
      <div className="pt-24 pb-12 bg-black min-h-screen">
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

          {/* Category Title */}
          <div className="text-center mb-12">
            <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-light text-white tracking-wide">
              {title || 'FASHION'}
            </h1>
          </div>

          {/* Portfolio Grid - 2 columns with overlay text */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {images.map((image, index) => (
              <div key={index} className="relative group overflow-hidden aspect-[4/5] cursor-pointer">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300"></div>
                
                {/* Overlay Text */}
                <div className="absolute inset-0 flex items-end p-6">
                  <div className="text-white">
                    <h3 className="text-xl md:text-2xl font-light tracking-wider uppercase">
                      {image.caption || `Project ${index + 1}`}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DefaultPortfolio;