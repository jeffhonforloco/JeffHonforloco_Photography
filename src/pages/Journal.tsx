import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Calendar, Tag } from 'lucide-react';
import Layout from '../components/Layout';
import { BlogData, BlogPost } from '@/types/content';

const Journal = () => {
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetch('/data/blog-posts.json')
      .then(response => response.json())
      .then(data => {
        setBlogData(data);
        setTimeout(() => setIsLoaded(true), 300);
      })
      .catch(error => console.error('Error loading blog data:', error));
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (!blogData) return;
    
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % blogData.posts.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(timer);
  }, [blogData]);

  const nextSlide = () => {
    if (!blogData) return;
    setCurrentSlide((prev) => (prev + 1) % blogData.posts.length);
  };

  const prevSlide = () => {
    if (!blogData) return;
    setCurrentSlide((prev) => (prev - 1 + blogData.posts.length) % blogData.posts.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (!blogData || !isLoaded) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 border-2 border-photo-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading journal...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const filteredPosts = selectedCategory 
    ? blogData.posts.filter((post: BlogPost) => post.category === selectedCategory)
    : blogData.posts;

  return (
    <Layout>
      {/* SEO Header - Hidden but accessible for search engines */}
      <div className="sr-only">
        <h1>Photography Journal - Tips, Trends & Insights</h1>
        <p>Professional photography blog featuring luxury fashion, beauty, and editorial photography tips. Expert photographer shares insights on techniques, client preparation, and industry trends.</p>
      </div>
      
      {/* Interactive Article Banner Slider */}
      <section className="relative min-h-screen pt-20">
        <div className="relative h-screen overflow-hidden">
          {/* Article Slides */}
          {blogData.posts.map((post: BlogPost, index: number) => (
            <div
              key={post.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out journal-slider-item ${
                index === currentSlide ? 'opacity-100 z-20 active' : 'opacity-0 z-10'
              }`}
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover hero-image"
                  style={{
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent"></div>
              </div>
              
              {/* Content Overlay */}
              <div className="relative z-30 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-8 md:px-16 grid lg:grid-cols-2 gap-16 items-center">
                  <div className="text-white animate-fade-in">
                    {/* Category Badge */}
                    <div className="inline-flex items-center px-4 py-2 bg-photo-red rounded-full mb-6">
                      <Tag className="w-4 h-4 mr-2" />
                      <span className="text-sm font-semibold uppercase tracking-wide">
                        {post.category.split(' ').slice(0, 2).join(' ')}
                      </span>
                    </div>
                    
                    {/* Title */}
                    <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
                      {post.title}
                    </h1>
                    
                    {/* Meta Info */}
                    <div className="flex items-center gap-6 text-gray-300 mb-8">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{post.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                    
                    {/* Excerpt */}
                    <p className="text-xl text-gray-300 leading-relaxed mb-10 max-w-2xl">
                      {post.excerpt}
                    </p>
                    
                    {/* CTA Button */}
                    <Link
                      to={`/journal/${post.id}`}
                      className="group inline-flex items-center px-8 py-4 bg-photo-red text-white font-semibold rounded-full hover:bg-photo-red-hover transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-photo-red/30"
                    >
                      <span>Read Full Article</span>
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Link>
                  </div>
                  
                  {/* Featured Image Preview */}
                  <div className="hidden lg:block">
                    <div className="relative">
                      <div className="aspect-[4/5] bg-gradient-to-br from-photo-red/20 to-transparent p-1 rounded-2xl">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover rounded-xl shadow-2xl"
                        />
                      </div>
                      <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-photo-red/20 rounded-full blur-xl"></div>
                      <div className="absolute -top-4 -left-4 w-16 h-16 border-2 border-photo-red/30 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Navigation Dots */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40">
            <div className="flex items-center gap-3">
              {blogData.posts.map((_: BlogPost, index: number) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentSlide 
                      ? 'bg-photo-red scale-125' 
                      : 'bg-white/30 hover:bg-white/50'
                  }`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>
          </div>
          
          {/* Navigation Arrows */}
          <button 
            onClick={prevSlide}
            className="absolute left-8 top-1/2 transform -translate-y-1/2 z-40 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-8 top-1/2 transform -translate-y-1/2 z-40 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:scale-110"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Category Filter Section */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="text-center mb-16">
            <h2 className="font-bold text-4xl md:text-5xl text-white mb-6 animate-fade-in">
              Explore by <span className="text-photo-red">Category</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto animate-fade-in animation-delay-200">
              Navigate through specialized topics and find exactly what inspires you
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 ${
                selectedCategory === null
                  ? 'bg-photo-red text-white shadow-lg shadow-photo-red/25'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {blogData.categories.map((category: string, index: number) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 hover:scale-105 animate-fade-in ${
                  selectedCategory === category
                    ? 'bg-photo-red text-white shadow-lg shadow-photo-red/25'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {category.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="text-center mb-16">
            <h2 className="font-bold text-4xl md:text-5xl text-white mb-6">
              {selectedCategory ? `${selectedCategory} Articles` : 'Latest Articles'}
            </h2>
            <div className="w-16 h-0.5 bg-photo-red mx-auto"></div>
          </div>

          <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredPosts.map((post: BlogPost, index: number) => (
              <Link
                key={post.id}
                to={`/journal/${post.id}`}
                className="group block animate-fade-in hover-scale"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <article className="bg-black rounded-2xl overflow-hidden border border-gray-800 hover:border-photo-red/30 transition-all duration-500 hover:shadow-2xl hover:shadow-photo-red/10">
                  {/* Image Container */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center px-3 py-1.5 bg-photo-red/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                        <Tag className="w-3 h-3 mr-1" />
                        {post.category.split(' ')[0]}
                      </span>
                    </div>

                    {/* Read Time */}
                    <div className="absolute bottom-4 right-4">
                      <span className="inline-flex items-center px-3 py-1.5 bg-black/70 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                        <Clock className="w-3 h-3 mr-1" />
                        {post.readTime}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-8">
                    <div className="flex items-center gap-3 text-gray-400 text-sm mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>

                    <h3 className="font-bold text-xl md:text-2xl text-white mb-4 leading-tight group-hover:text-photo-red transition-colors duration-300">
                      {post.title}
                    </h3>

                    <p className="text-gray-400 leading-relaxed mb-6 line-clamp-3">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center text-photo-red font-medium text-sm group-hover:gap-3 transition-all duration-300">
                      <span>Read Article</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-16">
            <button className="group inline-flex items-center px-8 py-4 bg-transparent border-2 border-photo-red text-photo-red font-semibold rounded-full hover:bg-photo-red hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-photo-red/25">
              <span>Load More Articles</span>
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-32 h-32 border border-photo-red rounded-full"></div>
          <div className="absolute bottom-32 right-20 w-24 h-24 border border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-photo-red/30 rounded-full"></div>
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto px-8 md:px-16">
          <div className="animate-fade-in">
            <h2 className="font-bold text-5xl md:text-6xl text-white mb-6">
              Stay <span className="text-photo-red">Inspired</span>
            </h2>
            <p className="text-gray-300 text-xl mb-12 leading-relaxed max-w-2xl mx-auto">
              Join our community of photographers and creatives. Get exclusive tips, 
              behind-the-scenes content, and early access to new articles.
            </p>

            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-6 py-4 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-full focus:border-photo-red focus:outline-none focus:ring-2 focus:ring-photo-red/20 transition-all duration-300"
                />
                <button className="group px-8 py-4 bg-photo-red text-white font-semibold rounded-full hover:bg-photo-red-hover transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-photo-red/25 whitespace-nowrap">
                  <span className="flex items-center">
                    Subscribe
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </button>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                No spam, unsubscribe at any time. Privacy policy applies.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Journal;