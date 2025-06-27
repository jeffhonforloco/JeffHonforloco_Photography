
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Portfolio = () => {
  const portfolioCategories = [
    {
      title: 'Beauty',
      description: 'Elegant beauty photography showcasing natural and enhanced aesthetics',
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/beauty',
      count: '24 Images'
    },
    {
      title: 'Fashion',
      description: 'Contemporary fashion photography with bold styling and creative concepts',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/fashion',
      count: '31 Images'
    },
    {
      title: 'Editorial',
      description: 'Storytelling through sophisticated editorial and commercial work',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/editorial',
      count: '18 Images'
    },
    {
      title: 'Glamour',
      description: 'Sophisticated glamour photography with dramatic lighting and styling',
      image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/glamour',
      count: '22 Images'
    },
    {
      title: 'Lifestyle',
      description: 'Authentic lifestyle moments captured with artistic vision',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/lifestyle',
      count: '27 Images'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 section-padding">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Portfolio</h1>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
            A curated collection of my work spanning beauty, fashion, editorial, 
            glamour, and lifestyle photography. Each category represents a unique 
            approach to visual storytelling.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolioCategories.map((category, index) => (
            <Link
              key={category.title}
              to={category.href}
              className="group animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden aspect-[4/5] bg-gray-900 mb-6">
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all duration-300">
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white mb-2">{category.title}</h3>
                    <p className="text-gray-300 text-sm">{category.count}</p>
                  </div>
                </div>
              </div>
              <div className="px-2">
                <h3 className="text-xl font-semibold mb-2 group-hover:text-photo-red transition-colors">
                  {category.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {category.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 section-padding bg-gray-900">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Something Amazing?</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            Let's discuss your next photography project and bring your vision to life.
          </p>
          <Link to="/contact" className="photo-button">
            Get in Touch
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Portfolio;
