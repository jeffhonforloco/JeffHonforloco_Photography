import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, ArrowRight, Tag, Share2 } from 'lucide-react';
import Layout from '../components/Layout';
import { BlogData, BlogPost } from '@/types/content';

const JournalArticle = () => {
  const { slug } = useParams();
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const [article, setArticle] = useState<BlogPost | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<BlogPost[]>([]);

  useEffect(() => {
    fetch('/data/blog-posts.json')
      .then(response => response.json())
      .then(data => {
        setBlogData(data);
        const foundArticle = data.posts.find((post: BlogPost) => post.id === slug);
        setArticle(foundArticle);
        
        // Get related articles (same category, excluding current)
        if (foundArticle) {
          const related = data.posts
            .filter((post: BlogPost) => post.id !== slug && post.category === foundArticle.category)
            .slice(0, 3);
          setRelatedArticles(related);
        }
      })
      .catch(error => console.error('Error loading article:', error));
  }, [slug]);

  if (!article) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-20 h-20 border-2 border-photo-red border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Loading article...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center pt-20">
        <div className="absolute inset-0">
          <img
            src={article.image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30"></div>
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto px-8 md:px-16 text-center text-white">
          {/* Back Button */}
          <Link 
            to="/journal"
            className="inline-flex items-center text-gray-300 hover:text-white mb-8 transition-colors duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journal
          </Link>
          
          {/* Category Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-photo-red rounded-full mb-6">
            <Tag className="w-4 h-4 mr-2" />
            <span className="text-sm font-semibold uppercase tracking-wide">
              {article.category.split(' ').slice(0, 2).join(' ')}
            </span>
          </div>
          
          {/* Title */}
          <h1 className="font-bold text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
            {article.title}
          </h1>
          
          {/* Meta Info */}
          <div className="flex items-center justify-center gap-6 text-gray-300 mb-8">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{article.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{article.readTime}</span>
            </div>
          </div>
          
          {/* Share Button */}
          <button className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full text-white hover:bg-white/20 transition-all duration-300">
            <Share2 className="w-4 h-4 mr-2" />
            Share Article
          </button>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-20 bg-photo-black">
        <div className="max-w-4xl mx-auto px-8 md:px-16">
          {/* Article Excerpt */}
          <div className="text-center mb-16">
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light">
              {article.excerpt}
            </p>
          </div>
          
          {/* Main Content */}
          <div className="prose prose-lg prose-invert max-w-none">
            <div className="text-gray-300 leading-relaxed text-lg space-y-8">
              {/* Dynamic content based on article */}
              {article.id === 'mastering-natural-light' && (
                <>
                  <p>
                    Natural light photography is an art that requires understanding of timing, positioning, and technique. 
                    As a professional photographer with over 15 years of experience, I've learned that mastering natural 
                    light is one of the most crucial skills you can develop.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Understanding Golden Hour</h2>
                  <p>
                    The golden hour—that magical time just after sunrise and before sunset—provides the most flattering 
                    natural light for portraits. The sun sits low on the horizon, creating warm, diffused light that 
                    eliminates harsh shadows and adds a beautiful glow to skin tones.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Window Light Techniques</h2>
                  <p>
                    Window light is incredibly versatile and available year-round. The key is understanding how to 
                    position your subject relative to the window. Side lighting creates dramatic shadows and depth, 
                    while positioning your subject directly facing the window provides even, flattering illumination.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Outdoor Portrait Strategies</h2>
                  <p>
                    When shooting outdoors, look for natural reflectors and diffusers. Light-colored walls, sand, 
                    or snow can act as reflectors, while overcast skies provide beautiful, even lighting. Avoid 
                    shooting in direct sunlight during midday unless you're specifically going for high-contrast, 
                    dramatic images.
                  </p>
                  
                  <div className="bg-gray-900 p-8 rounded-lg mt-12">
                    <h3 className="text-xl font-bold text-photo-red mb-4">Pro Tip</h3>
                    <p className="text-gray-300">
                      Always carry a small reflector or use your phone's flashlight as fill light when natural 
                      light creates too much contrast. Sometimes a little bit of artificial fill can make all 
                      the difference in achieving the perfect exposure.
                    </p>
                  </div>
                </>
              )}
              
              {article.id === 'building-fashion-portfolio' && (
                <>
                  <p>
                    Building a strong fashion photography portfolio requires strategic planning and careful curation. 
                    Your portfolio is your visual resume—it needs to tell a story about your style, technical skills, 
                    and creative vision.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Defining Your Style</h2>
                  <p>
                    Before you start shooting, spend time analyzing fashion photographers whose work resonates with you. 
                    What lighting techniques do they use? How do they compose their shots? Understanding these elements 
                    will help you develop your own unique aesthetic.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Essential Portfolio Pieces</h2>
                  <p>
                    A well-rounded fashion portfolio should include beauty shots, full-body fashion images, detail shots, 
                    and lifestyle fashion photography. Each image should demonstrate different aspects of your technical 
                    and creative abilities.
                  </p>
                </>
              )}
              
              {article.id === 'essential-camera-gear' && (
                <>
                  <p>
                    Professional portrait photography requires the right equipment to achieve consistent, high-quality results. 
                    While technique and creativity are paramount, having reliable gear that performs in various conditions 
                    is essential for professional work.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Camera Bodies</h2>
                  <p>
                    For professional portrait work, I recommend full-frame cameras for their superior low-light performance 
                    and shallow depth of field capabilities. The Canon 5D Mark IV and Sony A7R V are excellent choices 
                    that offer the resolution and dynamic range needed for high-end portrait work.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Essential Lenses</h2>
                  <p>
                    The 85mm f/1.4 is often called the portrait lens for good reason. It provides beautiful compression 
                    and bokeh while maintaining a comfortable working distance from your subject. A 50mm f/1.4 is also 
                    invaluable for environmental portraits and tighter spaces.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-8 md:px-16">
            <h2 className="font-bold text-3xl md:text-4xl text-white mb-12 text-center">
              Related Articles
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedArticles.map((relatedArticle: BlogPost) => (
                <Link
                  key={relatedArticle.id}
                  to={`/journal/${relatedArticle.id}`}
                  className="group block animate-fade-in hover-scale"
                >
                  <article className="bg-black rounded-xl overflow-hidden border border-gray-800 hover:border-photo-red/30 transition-all duration-500">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={relatedArticle.image}
                        alt={relatedArticle.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                        <Calendar className="w-4 h-4" />
                        <span>{relatedArticle.date}</span>
                      </div>
                      <h3 className="font-bold text-lg text-white mb-3 group-hover:text-photo-red transition-colors">
                        {relatedArticle.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-3">
                        {relatedArticle.excerpt}
                      </p>
                      <div className="flex items-center mt-4 text-photo-red text-sm font-medium">
                        <span>Read More</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 bg-photo-black">
        <div className="max-w-4xl mx-auto px-8 md:px-16 text-center">
          <h2 className="font-bold text-3xl md:text-4xl text-white mb-6">
            Want to Learn More?
          </h2>
          <p className="text-gray-300 text-lg mb-8 leading-relaxed">
            Subscribe to get the latest photography tips and techniques delivered to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-full focus:border-photo-red focus:outline-none"
            />
            <button className="px-8 py-3 bg-photo-red text-white font-semibold rounded-full hover:bg-photo-red-hover transition-all duration-300">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default JournalArticle;