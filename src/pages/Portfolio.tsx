import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';

const Portfolio = () => {
  const portfolioCategories = [
    {
      title: 'Editorial Beauty',
      subtitle: 'Sophisticated Editorial Work',
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/editorial',
      count: '18 Images',
      size: 'large', // spans 2 columns on large screens
      description: 'Storytelling through sophisticated editorial and commercial work'
    },
    {
      title: 'Glamour',
      subtitle: 'Dramatic & Elegant',
      image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/glamour',
      count: '22 Images',
      size: 'medium',
      description: 'Sophisticated glamour photography with dramatic lighting'
    },
    {
      title: 'Natural Beauty I',
      subtitle: 'Authentic Moments',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/beauty',
      count: '24 Images',
      size: 'medium',
      description: 'Natural beauty showcasing authentic aesthetics'
    },
    {
      title: 'Natural Beauty II',
      subtitle: 'Refined Elegance',
      image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/beauty',
      count: '24 Images',
      size: 'medium',
      description: 'Enhanced natural beauty with sophisticated lighting'
    },
    {
      title: 'Fashion I',
      subtitle: 'Contemporary Style',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/fashion',
      count: '31 Images',
      size: 'large',
      description: 'Bold fashion photography with creative concepts'
    },
    {
      title: 'Fashion II',
      subtitle: 'Editorial Fashion',
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/fashion',
      count: '31 Images',
      size: 'medium',
      description: 'Editorial fashion with innovative visual narratives'
    },
    {
      title: 'Hair',
      subtitle: 'Beauty & Texture',
      image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/beauty',
      count: '15 Images',
      size: 'medium',
      description: 'Specialized hair photography with artistic focus'
    },
    {
      title: 'Lifestyle',
      subtitle: 'Authentic Living',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/lifestyle',
      count: '27 Images',
      size: 'large',
      description: 'Authentic lifestyle moments with artistic vision'
    }
  ];

  return (
    <Layout>
      {/* Portfolio Grid */}
      <section className="pt-24 pb-20">
        <div className="max-w-8xl mx-auto px-4 md:px-8">
          {/* Masonry Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {portfolioCategories.map((category, index) => (
              <Link
                key={`${category.title}-${index}`}
                to={category.href}
                className={`group relative overflow-hidden rounded-lg animate-fade-in hover:scale-[1.02] transition-all duration-500 ${
                  category.size === 'large' 
                    ? 'md:col-span-2 aspect-[16/10]' 
                    : 'aspect-[4/5] md:aspect-square'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-8">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    {/* Category Title */}
                    <h2 className="font-bold text-2xl md:text-3xl lg:text-4xl text-white mb-2 leading-tight tracking-tight">
                      {category.title.toUpperCase()}
                    </h2>
                    
                    {/* Subtitle - Hidden on mobile, visible on hover */}
                    <p className="text-gray-300 text-sm md:text-base font-medium mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {category.subtitle}
                    </p>
                    
                    {/* Image Count */}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm font-medium">
                        {category.count}
                      </span>
                      
                      {/* Arrow Icon - Appears on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500">
                        <div className="w-8 h-8 bg-photo-red rounded-full flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Line Accent */}
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-photo-red to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Portfolio;