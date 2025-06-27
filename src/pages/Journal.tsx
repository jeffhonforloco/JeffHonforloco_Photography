
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const Journal = () => {
  const categories = [
    'Photography Tips & Techniques',
    'Client Preparation & Session Insights',
    'Equipment Reviews & Recommendations',
    'Industry Trends & News',
    'Personal Projects & Artistic Explorations',
    'Business & Marketing Advice'
  ];

  const featuredPosts = [
    {
      title: 'Mastering Natural Light in Portrait Photography',
      excerpt: 'Discover the secrets to creating stunning portraits using only natural light sources. Learn about golden hour timing, window light techniques, and outdoor portrait strategies.',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Photography Tips & Techniques',
      date: 'March 15, 2024',
      readTime: '8 min read',
      href: '/journal/mastering-natural-light'
    },
    {
      title: 'Building Your Fashion Photography Portfolio',
      excerpt: 'Essential tips for creating a compelling fashion photography portfolio that gets noticed by clients, agencies, and collaborators in the industry.',
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Business & Marketing Advice',
      date: 'March 10, 2024',
      readTime: '12 min read',
      href: '/journal/building-fashion-portfolio'
    },
    {
      title: 'Essential Camera Gear for Professional Portraits',
      excerpt: 'A comprehensive guide to the must-have equipment for professional portrait photography, from cameras and lenses to lighting and accessories.',
      image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Equipment Reviews & Recommendations',
      date: 'March 5, 2024',
      readTime: '10 min read',
      href: '/journal/essential-camera-gear'
    },
    {
      title: 'Preparing Models for Their First Photoshoot',
      excerpt: 'How to guide and prepare first-time models for a successful photoshoot experience, covering everything from wardrobe to posing basics.',
      image: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Client Preparation & Session Insights',
      date: 'February 28, 2024',
      readTime: '6 min read',
      href: '/journal/preparing-first-time-models'
    },
    {
      title: '2024 Photography Trends: What\'s Next',
      excerpt: 'Exploring the latest trends in photography for 2024, from aesthetic styles to technological innovations shaping the industry.',
      image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Industry Trends & News',
      date: 'February 20, 2024',
      readTime: '7 min read',
      href: '/journal/2024-photography-trends'
    },
    {
      title: 'Behind the Scenes: Creating Artistic Self-Portraits',
      excerpt: 'A personal exploration into the creative process of artistic self-portraiture, sharing techniques and inspiration behind recent work.',
      image: 'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      category: 'Personal Projects & Artistic Explorations',
      date: 'February 15, 2024',
      readTime: '9 min read',
      href: '/journal/artistic-self-portraits'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 section-padding">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Journal</h1>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto leading-relaxed">
            Photography insights, techniques, equipment reviews, and behind-the-scenes 
            stories from professional shoots and personal projects.
          </p>
        </div>

        {/* Categories */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Explore by Category</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <div
                key={category}
                className="bg-gray-900 p-6 hover:bg-gray-800 transition-colors cursor-pointer animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <h3 className="font-semibold text-photo-red mb-2">{category}</h3>
                <p className="text-gray-400 text-sm">
                  {category === 'Photography Tips & Techniques' && 'Lighting, composition, editing workflows'}
                  {category === 'Client Preparation & Session Insights' && 'Props, locations, session planning'}
                  {category === 'Equipment Reviews & Recommendations' && 'Cameras, lenses, software, accessories'}
                  {category === 'Industry Trends & News' && 'Fashion trends, tech updates, events'}
                  {category === 'Personal Projects & Artistic Explorations' && 'New styles, personal stories, collaborations'}
                  {category === 'Business & Marketing Advice' && 'Portfolio building, client relations, contracts'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Posts */}
        <div>
          <h2 className="text-3xl font-bold mb-12 text-center">Latest Articles</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {featuredPosts.map((post, index) => (
              <Link
                key={post.title}
                to={post.href}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="overflow-hidden aspect-[16/10] bg-gray-900 mb-6">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="mb-4">
                  <span className="text-photo-red text-sm font-medium">{post.category}</span>
                  <div className="flex items-center gap-3 text-gray-400 text-sm mt-1">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
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
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 section-padding bg-gray-900">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">Stay Updated</h2>
          <p className="text-gray-400 mb-8">
            Get the latest photography tips, techniques, and industry insights 
            delivered directly to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-black border border-gray-700 text-white focus:border-photo-red focus:outline-none"
            />
            <button className="photo-button whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Journal;
