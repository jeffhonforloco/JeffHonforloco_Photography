import Layout from '../Layout';
import ImageGallery from '../ImageGallery';

interface DefaultPortfolioProps {
  title: string;
  description: string;
  images: Array<{ src: string; alt: string; caption: string }>;
}

const DefaultPortfolio = ({ title, description, images }: DefaultPortfolioProps) => {
  return (
    <Layout>
      {/* SEO Header Section */}
      <section className="pt-32 pb-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-light text-white mb-6 tracking-wide">
            {title}
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed mb-8">
            {description}
          </p>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-photo-red to-transparent mx-auto"></div>
        </div>
      </section>

      {/* Portfolio Gallery Section */}
      <section className="py-12 section-padding">
        <div className="max-w-7xl mx-auto">
          {/* Image Gallery */}
          <ImageGallery images={images} className="animate-scale-in" />
        </div>
      </section>
    </Layout>
  );
};

export default DefaultPortfolio;