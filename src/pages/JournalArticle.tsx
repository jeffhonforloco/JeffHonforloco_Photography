import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ArrowLeft, ArrowRight, Tag, Share2 } from 'lucide-react';
import Layout from '../components/Layout';
import { BlogData, BlogPost } from '@/types/content';
import { apiService } from '@/lib/api-service';
import { toast } from '@/components/ui/use-toast';

// Renders HTML content from the Worker, or plain text from the static JSON fallback.
const HTML_TAG = /<[a-z][\s\S]*>/i;

const ArticleBody = ({ content }: { content: string }) => {
  if (HTML_TAG.test(content)) {
    return (
      <div
        className="text-gray-300 leading-relaxed text-lg space-y-6 article-body"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  // Plain-text fallback (legacy static posts)
  return (
    <p className="text-gray-300 leading-relaxed text-lg">{content}</p>
  );
};

const JournalArticle = () => {
  const { slug } = useParams();
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const [article, setArticle] = useState<BlogPost | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [relatedArticles, setRelatedArticles] = useState<BlogPost[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  useEffect(() => {
    const workerBase = import.meta.env.VITE_JOURNAL_API_URL as string | undefined;

    const loadFromData = (data: BlogData) => {
      setBlogData(data);
      const found = data.posts.find((post: BlogPost) => post.id === slug || post.slug === slug);
      if (found) {
        setArticle(found);
        setRelatedArticles(
          data.posts
            .filter((p: BlogPost) => p.id !== found.id && p.category === found.category)
            .slice(0, 3)
        );
      } else {
        setNotFound(true);
      }
    };

    if (workerBase) {
      // Try Worker API first: single-post endpoint
      fetch(`${workerBase}/api/journal/posts/${slug}`)
        .then(res => {
          if (!res.ok) throw new Error('not found');
          return res.json();
        })
        .then((post: BlogPost) => {
          setArticle(post);
          // Fetch related posts
          return fetch(`${workerBase}/api/journal/posts?category=${encodeURIComponent(post.category)}&limit=4`);
        })
        .then(res => res.json())
        .then((data: BlogData) => {
          setBlogData(data);
          setRelatedArticles(
            (data.posts || []).filter((p: BlogPost) => p.id !== slug && p.slug !== slug).slice(0, 3)
          );
        })
        .catch(() => {
          // Worker not deployed yet — fall back to static JSON
          fetch('/data/blog-posts.json')
            .then(r => r.json())
            .then(loadFromData)
            .catch(() => setNotFound(true));
        });
    } else {
      fetch('/data/blog-posts.json')
        .then(r => r.json())
        .then(loadFromData)
        .catch(() => setNotFound(true));
    }
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
            <ArticleBody content={article.content} />
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