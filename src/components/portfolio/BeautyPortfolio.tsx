import Layout from '../Layout';

interface BeautyPortfolioProps {
  images: Array<{ src: string; alt: string; caption: string }>;
}

const BeautyPortfolio = ({ images }: BeautyPortfolioProps) => {
  return (
    <Layout>
      <div className="min-h-screen bg-black pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-4">
          {/* Back to Portfolios Link */}
          <div className="mb-8">
            <a 
              href="/portfolio" 
              className="inline-flex items-center text-photo-red hover:text-photo-red-hover font-medium text-sm transition-colors duration-300"
            >
              ← Back to Portfolios
            </a>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="font-playfair text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-wider">
              LUXURY BEAUTY
            </h1>
          </div>

          {/* Image Grid - 2x2 on mobile, responsive */}
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            {images.slice(0, 4).map((image, index) => (
              <div key={index} className="aspect-[3/4] overflow-hidden">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>

          {/* Website URL */}
          <div className="text-center mt-12">
            <p className="text-gray-400 text-sm">
              jeffhonforloco.com
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BeautyPortfolio;