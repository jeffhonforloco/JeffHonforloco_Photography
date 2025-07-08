
import { Link } from 'react-router-dom';

const PortfolioCategories = () => {
  const portfolioCategories = [
    {
      title: 'Fashion Photography',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/luxury-fashion-photography-nyc',
      description: 'High-end fashion photography for luxury brands and fashion weeks'
    },
    {
      title: 'Beauty Photography',
      image: '/lovable-uploads/08c64276-3665-4346-a637-ca41acc6c602.png',
      href: '/portfolio/luxury-beauty-photography-nationwide',
      description: 'Premium beauty and cosmetic photography for luxury brands'
    },
    {
      title: 'Editorial Photography',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/editorial-photography-magazines',
      description: 'Magazine-quality editorial photography and brand storytelling'
    },
    {
      title: 'Celebrity & Lifestyle',
      image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/celebrity-lifestyle-photography',
      description: 'Exclusive celebrity and luxury lifestyle photography'
    }
  ];

  return (
    <section className="py-40 md:py-48 bg-photo-gray-900 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-photo-black/30 to-photo-gray-900"></div>
      
      <div className="relative max-w-8xl mx-auto px-8 md:px-16">
        <div className="text-center mb-32">
          <h2 className="font-playfair text-6xl md:text-7xl lg:text-8xl font-extralight tracking-wide text-white mb-12 leading-[0.9]">
            Luxury Portfolio
          </h2>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-photo-red to-transparent mx-auto mb-12"></div>
          <p className="font-light text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed tracking-wide">
            Award-winning fashion, beauty, editorial and celebrity photography across NYC, LA, Miami, Chicago and worldwide
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16">
          {portfolioCategories.map((category, index) => (
            <Link
              key={category.title}
              to={category.href}
              className="group block"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="relative aspect-[3/4] overflow-hidden mb-8">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-all duration-700"></div>
                <div className="absolute bottom-8 left-8">
                  <h3 className="font-playfair text-3xl md:text-4xl font-light text-white tracking-wide group-hover:text-photo-red transition-colors duration-500 mb-2">
                    {category.title}
                  </h3>
                  <p className="text-gray-300 text-sm max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    {category.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-20">
          <Link 
            to="/portfolio" 
            className="group relative bg-photo-red hover:bg-photo-red-hover text-white px-16 py-6 font-medium tracking-[0.2em] uppercase text-sm transition-all duration-700 hover:scale-105 hover:shadow-2xl hover:shadow-photo-red/40 overflow-hidden"
          >
            <span className="relative z-10">View All Work</span>
            <div className="absolute inset-0 bg-gradient-to-r from-photo-red-hover to-photo-red opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PortfolioCategories;
