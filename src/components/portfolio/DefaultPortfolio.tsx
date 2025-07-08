import { Link } from 'react-router-dom';
import Layout from '../Layout';

interface DefaultPortfolioProps {
  title: string;
  description: string;
  images: Array<{ src: string; alt: string; caption: string }>;
}

const DefaultPortfolio = ({ title, description, images }: DefaultPortfolioProps) => {
  // Fashion page specific images - newest first
  const fashionImages = [
    { src: '/lovable-uploads/8353fa23-da0a-4cdd-afad-c33e3622e179.png', alt: 'Fashion Photography', caption: 'FESTIVE ELEGANCE' },
    { src: '/lovable-uploads/3fc5d0bd-a575-4ac9-bab5-50b03bdf22c7.png', alt: 'Fashion Photography', caption: 'MODERN LUXURY' },
    { src: '/lovable-uploads/062059e1-5ef4-498c-b407-a160cca11bde.png', alt: 'Fashion Photography', caption: 'VINTAGE GLAMOUR' },
    { src: '/lovable-uploads/c1ee520a-9a4a-4911-9dfa-d722a9ff9f13.png', alt: 'Fashion Photography', caption: 'CLASSIC RED' },
    { src: '/lovable-uploads/9f62e7cd-99d7-45e0-9d5f-a98cd8354f01.png', alt: 'Fashion Photography', caption: 'SEQUIN GLAMOUR' },
    { src: '/lovable-uploads/5d3e488e-ff11-4efd-8d64-044581b14e19.png', alt: 'Fashion Photography', caption: 'BOLD STATEMENT' },
    { src: '/lovable-uploads/42c6c903-6fe9-4f85-8990-92ed8fd4b8c1.png', alt: 'Fashion Photography', caption: 'RED ELEGANCE' },
    { src: '/lovable-uploads/fa05c636-4d55-4c2f-b703-54c585db6b63.png', alt: 'Fashion Photography', caption: 'GOLDEN GLAMOUR' },
    { src: '/lovable-uploads/ee980b4e-6191-4a5e-9154-a0570d5a5cf7.png', alt: 'Fashion Photography', caption: 'VIBRANT STYLE' },
    { src: '/lovable-uploads/fa096df6-9e5b-4c94-b2eb-fcd21afd9464.png', alt: 'Fashion Photography', caption: 'WHITE ELEGANCE' },
    { src: '/lovable-uploads/2c5c9feb-d64a-4aef-8a8f-befaa483c3b9.png', alt: 'Fashion Photography', caption: 'LUXURY FASHION' },
    { src: '/lovable-uploads/b8d7af04-86fd-40a8-b960-3797187fa27c.png', alt: 'Fashion Photography', caption: 'EVENING WEAR' },
    { src: '/lovable-uploads/378e6920-c0d7-4bf9-85b7-6094238a8a9e.png', alt: 'Fashion Photography', caption: 'GLAMOUR COLLECTION' },
    { src: '/lovable-uploads/8fba258d-35bd-4852-9e00-2f58fa836046.png', alt: 'Fashion Photography', caption: 'DESIGNER COLLECTION' },
    { src: '/lovable-uploads/3e678cfc-4a4a-49e7-b36d-922d97afa616.png', alt: 'Fashion Photography', caption: 'HAUTE COUTURE' },
    { src: '/lovable-uploads/239d878c-3190-41aa-8c43-e21ba98f8ac0.png', alt: 'Fashion Photography', caption: 'EDITORIAL STYLE' },
    { src: '/lovable-uploads/240d3762-7b5f-4cef-bec9-82ae136256b7.png', alt: 'Fashion Photography', caption: 'MONOCHROME ELEGANCE' },
    { src: '/lovable-uploads/f3678f5a-0d65-447d-a666-681414ba5683.png', alt: 'Fashion Photography', caption: 'SOPHISTICATED GLAMOUR' },
    { src: '/lovable-uploads/1b3d1966-a116-4938-9368-5094259e1fe6.png', alt: 'Fashion Photography', caption: 'FORMAL COUTURE' },
    { src: '/lovable-uploads/fe3059c7-202d-4437-8785-42cc1fc2cab4.png', alt: 'Fashion Photography', caption: 'CONTEMPORARY STYLE' }
  ];

  const displayImages = title === 'FASHION' || window.location.pathname.includes('luxury-fashion-photography-nyc') ? fashionImages : images;
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
              FASHION
            </h1>
          </div>

          {/* Portfolio Grid - 2 columns clean layout */}
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {displayImages.map((image, index) => (
              <div key={index} className="relative group overflow-hidden aspect-[4/5] cursor-pointer">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
              </div>
            ))}
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

export default DefaultPortfolio;