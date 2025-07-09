import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import LazyImage from '../components/common/LazyImage';

const Portfolio = () => {
  const portfolioCategories = [
    {
      title: 'Fashion',
      slug: 'fashion',
      image: '/lovable-uploads/9cac59de-27c1-4b0a-8c2b-1d8333486e54.png',
      href: '/portfolios/fashion',
      description: 'High-end fashion photography for luxury brands, fashion weeks, and celebrity campaigns across NYC, LA, and major fashion capitals.',
      keywords: 'luxury fashion photographer NYC, high-end fashion photography, fashion week photographer, celebrity fashion shoots'
    },
    {
      title: 'Glamour',
      slug: 'glamour',
      image: '/lovable-uploads/7c6c25d5-48ef-4f79-8369-b5edab7ddc85.png',
      href: '/portfolios/glamour',
      description: 'Sophisticated glamour photography capturing elegance, allure, and timeless beauty with dramatic lighting and styling.',
      keywords: 'glamour photographer, sophisticated portraits, dramatic lighting, elegant photography'
    },
    {
      title: 'Beauty', 
      slug: 'beauty',
      image: '/lovable-uploads/08c64276-3665-4346-a637-ca41acc6c602.png',
      href: '/portfolios/beauty',
      description: 'Premium beauty and cosmetic photography for luxury brands, featuring sophisticated lighting and flawless execution.',
      keywords: 'luxury beauty photographer, cosmetic photography, beauty campaign photographer, high-end beauty shoots'
    },
    {
      title: 'Editorial',
      slug: 'editorial',
      image: '/lovable-uploads/67b5c2bf-d1a3-44e4-af56-212f23e37262.png', 
      href: '/portfolios/editorial',
      description: 'Magazine-quality editorial photography for publications, brands, and storytelling campaigns that captivate audiences.',
      keywords: 'editorial photographer, magazine photographer, commercial editorial photography, brand storytelling'
    },
    {
      title: 'Lifestyle',
      slug: 'lifestyle',
      image: '/lovable-uploads/bcd80ca3-d60c-4596-9a71-4b8602583ff7.png',
      href: '/portfolios/lifestyle',
      description: 'Exclusive celebrity and luxury lifestyle photography capturing authentic moments and sophisticated aesthetics.',
      keywords: 'celebrity photographer, luxury lifestyle photography, exclusive portrait photography, high-profile clients'
    }
  ];

  return (
    <Layout>
      {/* Main Portfolio Grid */}
      <div className="min-h-screen bg-black pt-24">
        <div className="max-w-7xl mx-auto px-4 py-12">
          
          {/* Mobile Grid - 2 columns */}
          <div className="grid grid-cols-2 md:hidden gap-3">
            {portfolioCategories.map((category, index) => (
              <Link 
                key={index}
                to={category.href} 
                className="relative group overflow-hidden aspect-square"
              >
                <LazyImage
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-black/40"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-white text-sm font-light tracking-wider text-center uppercase px-2">
                    {category.title}
                  </h2>
                </div>
              </Link>
            ))}
            {/* Add empty div if odd number to balance grid */}
            {portfolioCategories.length % 2 !== 0 && <div></div>}
          </div>

          {/* Desktop Grid - 4 columns uniform */}
          <div className="hidden md:grid grid-cols-4 gap-4">
            {portfolioCategories.map((category, index) => (
              <Link 
                key={index}
                to={category.href} 
                className="relative group overflow-hidden aspect-square hover:scale-105 transition-transform duration-500"
              >
                <LazyImage
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover"
                  fetchPriority="high"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-all duration-300"></div>
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <div className="text-center">
                    <h2 className="text-white text-2xl xl:text-3xl font-light tracking-wider uppercase mb-3">
                      {category.title}
                    </h2>
                    <div className="w-16 h-px bg-white/60 mx-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Copyright Notice */}
          <div className="text-center mt-16 pb-8">
            <p className="text-white/60 text-sm tracking-wide">
              © 2025 Jeff Honforloco Photography. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Portfolio;