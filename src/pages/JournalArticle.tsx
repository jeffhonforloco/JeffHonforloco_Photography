import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, ArrowRight, Tag, Share2 } from 'lucide-react';
import Layout from '../components/Layout';
import { BlogData, BlogPost } from '@/types/content';
import { apiService } from '@/lib/api-service';
import { toast } from '@/components/ui/use-toast';

const JournalArticle = () => {
  const { slug } = useParams();
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const [article, setArticle] = useState<BlogPost | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<BlogPost[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  useEffect(() => {
    fetch('/data/blog-posts.json')
      .then(response => response.json())
      .then(data => {
        setBlogData(data);
        const foundArticle = data.posts.find((post: BlogPost) => post.id === slug);
        if (foundArticle) {
          setArticle(foundArticle);
          const related = data.posts
            .filter((post: BlogPost) => post.id !== slug && post.category === foundArticle.category)
            .slice(0, 3);
          setRelatedArticles(related);
        } else {
          setNotFound(true);
        }
      })
      .catch(error => console.error('Error loading article:', error));
  }, [slug]);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterLoading(true);
    try {
      const result = await apiService.sendNewsletterSignup(newsletterEmail);
      if (result.success) {
        setNewsletterEmail('');
        toast({ title: "Subscribed!", description: "You'll receive our latest articles and tips." });
      } else {
        throw new Error(result.error || 'Failed to subscribe');
      }
    } catch {
      toast({ title: "Error", description: "Failed to subscribe. Please try again.", variant: "destructive" });
    } finally {
      setNewsletterLoading(false);
    }
  };

  if (notFound) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Article Not Found</h1>
            <p className="text-gray-400 mb-6">The article you're looking for doesn't exist.</p>
            <Link to="/journal" className="inline-flex items-center px-6 py-3 bg-photo-red text-white rounded-full hover:bg-photo-red-hover transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Journal
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

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
              {article.id === 'how-to-prepare-beauty-photography-session-nyc' && (
                <>
                  <p>
                    Preparing for a luxury beauty photography session in NYC requires careful planning and attention to detail. 
                    As a professional beauty photographer serving Manhattan, Brooklyn, and the greater NYC area, I've compiled 
                    this comprehensive guide to help you get the most stunning results from your session.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Pre-Session Consultation</h2>
                  <p>
                    Before your NYC beauty photography session, we'll conduct a detailed consultation to discuss your vision, 
                    preferred aesthetic, and intended use for the images. Whether you're building a modeling portfolio, 
                    launching a beauty brand, or creating content for social media, understanding your goals helps me 
                    tailor the session to meet your specific needs.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Skincare Preparation (48-72 Hours Before)</h2>
                  <p>
                    Your skin is the canvas for beauty photography. I recommend avoiding new skincare products, aggressive 
                    treatments, or facial extractions 48-72 hours before the session. Stick to your regular routine, 
                    stay hydrated, and get plenty of sleep. If you're prone to breakouts, avoid dairy and high-sodium foods 
                    the day before your session.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Hair and Makeup Planning</h2>
                  <p>
                    For luxury beauty sessions in NYC, I work with top-tier makeup artists and hair stylists. We'll create 
                    multiple looks ranging from natural beauty to high-fashion editorial. Arrive with clean, moisturized skin 
                    and freshly washed hair. Bring reference images of makeup looks you love, and we'll adapt them to 
                    complement your features and the lighting setup.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">What to Bring to Your NYC Session</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Multiple outfit options in colors that complement your skin tone</li>
                    <li>Statement jewelry and accessories for variety</li>
                    <li>Comfortable shoes for walking between NYC locations</li>
                    <li>Touch-up makeup for quick refreshes</li>
                    <li>Water and light snacks to stay energized</li>
                    <li>Reference images on your phone for inspiration</li>
                  </ul>
                  
                  <div className="bg-gray-900 p-8 rounded-lg mt-12">
                    <h3 className="text-xl font-bold text-photo-red mb-4">NYC Studio vs. Location Shoots</h3>
                    <p className="text-gray-300">
                      My Manhattan studio offers controlled lighting and climate, perfect for beauty close-ups and detail work. 
                      For location shoots, we can explore iconic NYC backdrops like Central Park, Brooklyn Bridge, or urban 
                      rooftops for a more editorial aesthetic. Each option creates different moods and serves different purposes 
                      in your final portfolio.
                    </p>
                  </div>
                </>
              )}
              
              {article.id === 'best-editorial-photography-ideas-personal-brands' && (
                <>
                  <p>
                    Editorial photography for personal brands goes beyond traditional headshots. It's about creating a visual 
                    story that communicates your values, expertise, and unique perspective to your target audience. As a 
                    photographer specializing in high-end personal branding for entrepreneurs and professionals, I've 
                    developed these proven concepts that elevate personal brands.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">The Power Player Series</h2>
                  <p>
                    This concept positions you as an industry leader through sophisticated environmental portraits. We photograph 
                    you in settings that reflect your expertise—a CEO in their boardroom, a chef in their kitchen, or a designer 
                    in their studio. The key is authentic environments that tell your professional story while maintaining 
                    editorial sophistication.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Behind-the-Scenes Storytelling</h2>
                  <p>
                    People connect with processes and authenticity. This editorial approach captures you in action—strategizing, 
                    creating, collaborating. These images work beautifully for "About" pages, social media content, and press 
                    materials because they show the human side of your brand while maintaining professional credibility.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Minimalist Authority</h2>
                  <p>
                    Clean, minimalist compositions that focus entirely on you and your expression. These editorial portraits 
                    use negative space, careful lighting, and simple backgrounds to create images that command attention 
                    without distraction. Perfect for speakers, consultants, and thought leaders who want to convey expertise 
                    and approachability.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Lifestyle Integration</h2>
                  <p>
                    This concept weaves your personal and professional life together, showing how your expertise extends 
                    beyond the office. A wellness coach photographed during their morning routine, or a financial advisor 
                    in their home office. These images create relatability while reinforcing your brand message.
                  </p>
                  
                  <div className="bg-gray-900 p-8 rounded-lg mt-12">
                    <h3 className="text-xl font-bold text-photo-red mb-4">Color Psychology in Personal Branding</h3>
                    <p className="text-gray-300">
                      The colors you wear and the environments we choose significantly impact how your audience perceives your brand. 
                      Navy and charcoal convey trustworthiness and expertise, while burgundy and emerald suggest luxury and 
                      sophistication. We'll select a color palette that aligns with your brand values and target audience expectations.
                    </p>
                  </div>
                </>
              )}
              
              {article.id === 'luxury-fashion-photography-trends-2025' && (
                <>
                  <p>
                    The luxury fashion photography landscape continues to evolve in 2025, with new aesthetic directions and 
                    technological innovations shaping how we capture and present high-end fashion. Having worked with luxury 
                    brands and fashion weeks across NYC, LA, and internationally, I'm seeing several key trends dominating 
                    the industry this year.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Hyper-Realistic Textures</h2>
                  <p>
                    2025 is all about showcasing fabric textures with unprecedented detail. Luxury brands want viewers to 
                    almost feel the cashmere, silk, or leather through the image. This trend requires specialized lighting 
                    techniques and macro lenses to capture every thread and surface detail, creating images that are both 
                    artistic and commercial.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Sustainable Luxury Aesthetics</h2>
                  <p>
                    As sustainability becomes central to luxury fashion, photography is reflecting this shift through natural 
                    settings, organic lighting, and earth-tone palettes. The aesthetic celebrates craftsmanship and longevity 
                    over fast fashion, with images that feel timeless and environmentally conscious.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Cultural Fusion Concepts</h2>
                  <p>
                    Luxury fashion photography in 2025 embraces global perspectives, combining traditional craftsmanship 
                    from different cultures with contemporary luxury design. This trend creates rich, layered narratives 
                    that celebrate diversity while maintaining the sophistication expected from high-end fashion imagery.
                  </p>
                </>
              )}
              
              {article.id === 'celebrity-photographer-secrets-stunning-portraits' && (
                <>
                  <p>
                    Working with celebrities and high-profile clients requires a unique set of skills beyond technical 
                    photography expertise. Having photographed A-list celebrities, models, and entertainment industry 
                    professionals, I've learned that creating stunning portraits is as much about psychology and 
                    professionalism as it is about lighting and composition.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Creating Immediate Trust</h2>
                  <p>
                    Celebrities often have limited time and high expectations. The key is establishing trust within the 
                    first few minutes. I always arrive early, have all equipment tested, and present a clear vision for 
                    the shoot. Confidence and preparation translate into better portraits because your subject can relax 
                    and focus on performance rather than logistics.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">The Psychology of Posing</h2>
                  <p>
                    Great celebrity portraits capture authentic expressions, not just perfect poses. I guide subjects 
                    through emotions and thoughts rather than just physical positions. Asking them to think about a 
                    specific memory or feeling often produces more genuine expressions than traditional posing directions.
                  </p>
                  
                  <h2 className="text-2xl font-bold text-white mt-12 mb-6">Technical Excellence Under Pressure</h2>
                  <p>
                    When you have 15 minutes with a major celebrity, every shot must count. This requires mastering your 
                    camera settings, having backup equipment ready, and knowing exactly how to achieve your desired look 
                    quickly. I always test lighting setups with assistants before the talent arrives.
                  </p>
                </>
              )}
              
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
          <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              required
              className="flex-1 px-6 py-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-400 rounded-full focus:border-photo-red focus:outline-none"
            />
            <button
              type="submit"
              disabled={newsletterLoading}
              className="px-8 py-3 bg-photo-red text-white font-semibold rounded-full hover:bg-photo-red-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default JournalArticle;