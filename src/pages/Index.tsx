
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Index = () => {
  const portfolioCategories = [
    {
      title: 'Beauty',
      image: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/beauty'
    },
    {
      title: 'Fashion',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/fashion'
    },
    {
      title: 'Editorial',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/editorial'
    },
    {
      title: 'Glamour',
      image: 'https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      href: '/portfolio/glamour'
    }
  ];

  const latestJournalPosts = [
    {
      title: 'Mastering Natural Light in Portrait Photography',
      excerpt: 'Discover the secrets to creating stunning portraits using only natural light sources.',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      href: '/journal/mastering-natural-light'
    },
    {
      title: 'Building Your Fashion Photography Portfolio',
      excerpt: 'Essential tips for creating a compelling fashion photography portfolio that gets noticed.',
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      href: '/journal/building-fashion-portfolio'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section flex items-center justify-center relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1500375592092-40eb2168fd21?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <div className="relative z-10 text-center section-padding animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            JEFF HONFORLOCO
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl mx-auto">
            Professional Portrait & Fashion Photography
          </p>
          <p className="text-lg mb-12 text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Capturing authentic moments and creating stunning visual narratives through 
            the lens of artistic vision and technical excellence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/portfolio" className="photo-button">
              View Portfolio
            </Link>
            <Link to="/contact" className="border border-photo-red text-photo-red hover:bg-photo-red hover:text-white px-8 py-3 font-medium transition-all duration-300">
              Book a Session
            </Link>
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="py-20 section-padding">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Portfolio</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Explore my work across different photography styles and genres
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {portfolioCategories.map((category, index) => (
            <Link
              key={category.title}
              to={category.href}
              className="group relative overflow-hidden aspect-[4/5] bg-gray-900"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <img
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300">
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-2xl font-bold text-white">{category.title}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link to="/portfolio" className="photo-button">
            View All Work
          </Link>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 section-padding bg-gray-900">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">About Jeff</h2>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              With over a decade of experience in professional photography, I specialize in 
              creating compelling visual stories that capture the essence of my subjects. 
              My work spans fashion, beauty, editorial, and lifestyle photography.
            </p>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Every shoot is an opportunity to create something extraordinary, combining 
              technical precision with artistic vision to deliver images that resonate 
              and inspire.
            </p>
            <Link to="/about" className="photo-button">
              Learn More
            </Link>
          </div>
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Jeff Honforloco"
              className="w-full h-[600px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Latest Journal Posts */}
      <section className="py-20 section-padding">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Latest from the Journal</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Photography insights, techniques, and behind-the-scenes stories
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {latestJournalPosts.map((post, index) => (
            <Link
              key={post.title}
              to={post.href}
              className="group"
            >
              <div className="overflow-hidden aspect-[16/10] bg-gray-900 mb-6">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-photo-red transition-colors">
                {post.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {post.excerpt}
              </p>
            </Link>
          ))}
        </div>

        <div className="text-center">
          <Link to="/journal" className="photo-button">
            Read More Articles
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
