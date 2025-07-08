import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';

const Portfolio = () => {
  const portfolioCategories = [
    {
      title: 'Fashion',
      slug: 'luxury-fashion-photography-nyc',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/luxury-fashion-photography-nyc',
      description: 'High-end fashion photography for luxury brands, fashion weeks, and celebrity campaigns across NYC, LA, and major fashion capitals.',
      keywords: 'luxury fashion photographer NYC, high-end fashion photography, fashion week photographer, celebrity fashion shoots'
    },
    {
      title: 'Glamour',
      slug: 'glamour-photography',
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/glamour-photography',
      description: 'Sophisticated glamour photography capturing elegance, allure, and timeless beauty with dramatic lighting and styling.',
      keywords: 'glamour photographer, sophisticated portraits, dramatic lighting, elegant photography'
    },
    {
      title: 'Beauty', 
      slug: 'luxury-beauty-photography-nationwide',
      image: '/lovable-uploads/08c64276-3665-4346-a637-ca41acc6c602.png',
      href: '/portfolio/luxury-beauty-photography-nationwide',
      description: 'Premium beauty and cosmetic photography for luxury brands, featuring sophisticated lighting and flawless execution.',
      keywords: 'luxury beauty photographer, cosmetic photography, beauty campaign photographer, high-end beauty shoots'
    },
    {
      title: 'Editorial',
      slug: 'editorial-photography-magazines',
      image: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
      href: '/portfolio/editorial-photography-magazines',
      description: 'Magazine-quality editorial photography for publications, brands, and storytelling campaigns that captivate audiences.',
      keywords: 'editorial photographer, magazine photographer, commercial editorial photography, brand storytelling'
    },
    {
      title: 'Celebrity & Lifestyle',
      slug: 'celebrity-lifestyle-photography',
      image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/celebrity-lifestyle-photography',
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
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover"
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
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover"
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