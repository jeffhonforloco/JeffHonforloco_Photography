import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';

const Portfolio = () => {
  const portfolioCategories = [
    {
      title: 'Fashion Photography',
      slug: 'luxury-fashion-photography-nyc',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/luxury-fashion-photography-nyc',
      description: 'High-end fashion photography for luxury brands, fashion weeks, and celebrity campaigns across NYC, LA, and major fashion capitals.',
      keywords: 'luxury fashion photographer NYC, high-end fashion photography, fashion week photographer, celebrity fashion shoots'
    },
    {
      title: 'Beauty Photography', 
      slug: 'luxury-beauty-photography-nationwide',
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/luxury-beauty-photography-nationwide',
      description: 'Premium beauty and cosmetic photography for luxury brands, featuring sophisticated lighting and flawless execution.',
      keywords: 'luxury beauty photographer, cosmetic photography, beauty campaign photographer, high-end beauty shoots'
    },
    {
      title: 'Editorial Photography',
      slug: 'editorial-photography-magazines',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 
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
      {/* SEO Header Section */}
      <section className="pt-32 pb-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-photo-red to-transparent mx-auto"></div>
        </div>
      </section>

      <div className="min-h-screen bg-black">

        {/* Mobile Grid Layout - 2 columns */}
        <div className="px-4 pt-24 pb-20">
          <div className="max-w-md mx-auto md:max-w-7xl">
            
            {/* Mobile: Simple 2-column grid */}
            <div className="md:hidden grid grid-cols-2 gap-3">
              {portfolioCategories.map((category, index) => (
                <Link 
                  key={index}
                  to={category.href} 
                  className="relative group overflow-hidden aspect-square bg-gray-900"
                >
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                    <h2 className="text-lg font-light text-white tracking-wider text-center uppercase mb-2">
                      {category.title}
                    </h2>
                    <p className="text-xs text-gray-300 text-center px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {category.description.substring(0, 60)}...
                    </p>
                  </div>
                </Link>
              ))}
              
              {/* Add an empty slot to make it 6 items (3 rows x 2 columns) if needed */}
              <div className="aspect-square bg-transparent"></div>
            </div>

            {/* Desktop Layout - Keep existing complex layout */}
            <div className="hidden md:block">
              {/* First Row - Beauty (large) + Fashion */}
              <div className="grid grid-cols-3 gap-4 mb-4 h-[500px]">
                {/* Beauty - Takes 2 columns on desktop */}
                <Link 
                  to={portfolioCategories[0].href}
                  className="col-span-2 relative group overflow-hidden bg-gray-900"
                >
                  <img
                    src={portfolioCategories[0].image}
                    alt={portfolioCategories[0].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
                  <div className="absolute bottom-8 left-8">
                    <h2 className="text-4xl font-light text-white tracking-wide mb-2">
                      {portfolioCategories[0].title}
                    </h2>
                    <p className="text-gray-300 text-sm max-w-md">
                      {portfolioCategories[0].description}
                    </p>
                  </div>
                </Link>

                {/* Fashion - Takes 1 column on desktop */}
                <Link 
                  to={portfolioCategories[1].href}
                  className="relative group overflow-hidden bg-gray-900"
                >
                  <img
                    src={portfolioCategories[1].image}
                    alt={portfolioCategories[1].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
                  <div className="absolute bottom-8 left-8">
                    <h2 className="text-3xl font-light text-white tracking-wide mb-2">
                      {portfolioCategories[1].title}
                    </h2>
                    <p className="text-gray-300 text-sm max-w-xs">
                      {portfolioCategories[1].description.substring(0, 80)}...
                    </p>
                  </div>
                </Link>
              </div>

              {/* Second Row - Editorial + Celebrity & Lifestyle */}
              <div className="grid grid-cols-2 gap-4 h-[400px] mb-4">
                {/* Editorial */}
                <Link 
                  to={portfolioCategories[2].href}
                  className="relative group overflow-hidden bg-gray-900"
                >
                  <img
                    src={portfolioCategories[2].image}
                    alt={portfolioCategories[2].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
                  <div className="absolute bottom-8 left-8">
                    <h2 className="text-3xl font-light text-white tracking-wide mb-2">
                      {portfolioCategories[2].title}
                    </h2>
                    <p className="text-gray-300 text-sm max-w-xs">
                      {portfolioCategories[2].description.substring(0, 80)}...
                    </p>
                  </div>
                </Link>

                {/* Celebrity & Lifestyle */}
                <Link 
                  to={portfolioCategories[3].href}
                  className="relative group overflow-hidden bg-gray-900"
                >
                  <img
                    src={portfolioCategories[3].image}
                    alt={portfolioCategories[3].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
                  <div className="absolute bottom-8 left-8">
                    <h2 className="text-3xl font-light text-white tracking-wide mb-2">
                      {portfolioCategories[3].title}
                    </h2>
                    <p className="text-gray-300 text-sm max-w-xs">
                      {portfolioCategories[3].description.substring(0, 80)}...
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            {/* Copyright Notice */}
            <div className="text-center mt-16 pb-8 px-8">
              <p className="text-white/60 text-sm tracking-wide">
                © 2025 Jeff Honforloco Photography. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Portfolio;