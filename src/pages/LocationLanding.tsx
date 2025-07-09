import { useParams, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '../components/Layout';
import HeroSection from '../components/sections/HeroSection';
import FeaturedWork from '../components/sections/FeaturedWork';
import AboutPreview from '../components/sections/AboutPreview';
import Recognition from '../components/sections/Recognition';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// Location data for SEO optimization
const locationData = {
  'nyc': {
    name: 'New York City',
    region: 'New York',
    country: 'USA',
    title: 'Luxury Fashion & Beauty Photographer NYC | Jeff Honforloco',
    description: 'Premier luxury fashion and beauty photographer in New York City. High-end editorial photography for top brands, celebrities, and models in Manhattan.',
    keywords: 'luxury fashion photographer NYC, beauty photographer New York, editorial photographer Manhattan, celebrity photographer NYC, high-end fashion photography New York',
    localText: 'Serving the heart of fashion in New York City, from Manhattan studios to Brooklyn locations.',
    services: ['Fashion Week Photography', 'Beauty Campaigns', 'Editorial Shoots', 'Celebrity Portraits']
  },
  'la': {
    name: 'Los Angeles',
    region: 'California', 
    country: 'USA',
    title: 'Top Fashion & Beauty Photographer Los Angeles | Jeff Honforloco',
    description: 'Award-winning luxury fashion and beauty photographer in Los Angeles. Premium photography services for Hollywood celebrities and luxury brands.',
    keywords: 'fashion photographer Los Angeles, beauty photographer LA, celebrity photographer Hollywood, luxury photography California',
    localText: 'Capturing glamour and elegance across Los Angeles, from Hollywood studios to Malibu beaches.',
    services: ['Celebrity Photography', 'Fashion Campaigns', 'Beauty Editorials', 'Lifestyle Shoots']
  },
  'miami': {
    name: 'Miami',
    region: 'Florida',
    country: 'USA', 
    title: 'Miami Luxury Fashion & Beauty Photographer | Jeff Honforloco',
    description: 'Elite fashion and beauty photographer in Miami. Specializing in luxury brand photography with tropical elegance and international flair.',
    keywords: 'fashion photographer Miami, beauty photographer Florida, luxury photography Miami Beach, editorial photographer South Beach',
    localText: 'Bringing international sophistication to Miami\'s vibrant fashion scene.',
    services: ['Resort Fashion Photography', 'Beauty Campaigns', 'International Editorial', 'Luxury Brand Photography']
  },
  'paris': {
    name: 'Paris',
    region: 'Île-de-France',
    country: 'France',
    title: 'Luxury Fashion Photographer Paris | Jeff Honforloco Photography',
    description: 'International luxury fashion and beauty photographer available in Paris. Haute couture and editorial photography in the fashion capital of the world.',
    keywords: 'fashion photographer Paris, luxury photographer France, haute couture photographer, editorial photographer Paris',
    localText: 'Collaborating with Parisian elegance and haute couture excellence in the world\'s fashion capital.',
    services: ['Haute Couture Photography', 'Fashion Week Paris', 'Luxury Editorial', 'International Campaigns']
  },
  'london': {
    name: 'London',
    region: 'England',
    country: 'United Kingdom',
    title: 'Elite Fashion & Beauty Photographer London | Jeff Honforloco',
    description: 'Premier luxury fashion and beauty photographer serving London. International editorial and campaign photography for discerning brands.',
    keywords: 'fashion photographer London, luxury photographer UK, beauty photographer England, editorial photographer London',
    localText: 'Delivering sophisticated photography services across London\'s dynamic fashion landscape.',
    services: ['Editorial Photography', 'Fashion Campaigns', 'Beauty Photography', 'International Projects']
  },
  'italy': {
    name: 'Italy',
    region: 'Multiple Regions',
    country: 'Italy',
    title: 'Luxury Fashion Photographer Italy | Jeff Honforloco Photography',
    description: 'International fashion and beauty photographer available throughout Italy. Milan fashion week and luxury brand photography services.',
    keywords: 'fashion photographer Italy, luxury photographer Milan, beauty photographer Rome, Italian fashion photography',
    localText: 'Capturing Italian elegance and luxury from Milan\'s fashion districts to Rome\'s timeless beauty.',
    services: ['Milan Fashion Week', 'Luxury Brand Photography', 'Italian Editorial', 'International Campaigns']
  },
  'lagos': {
    name: 'Lagos',
    region: 'Lagos State',
    country: 'Nigeria',
    title: 'Premier Fashion & Beauty Photographer Lagos | Jeff Honforloco',
    description: 'International luxury fashion and beauty photographer serving Lagos. Contemporary African fashion and beauty photography excellence.',
    keywords: 'fashion photographer Lagos, luxury photographer Nigeria, beauty photographer West Africa, international photographer Lagos',
    localText: 'Celebrating African elegance and contemporary fashion in Lagos\'s vibrant creative scene.',
    services: ['African Fashion Photography', 'Beauty Campaigns', 'Contemporary Editorial', 'International Projects']
  },
  'switzerland': {
    name: 'Switzerland',
    region: 'Multiple Cantons',
    country: 'Switzerland',
    title: 'Luxury Fashion Photographer Switzerland | Jeff Honforloco',
    description: 'Elite international fashion and beauty photographer available in Switzerland. Premium photography services with Alpine elegance.',
    keywords: 'fashion photographer Switzerland, luxury photographer Zurich, beauty photographer Geneva, Swiss fashion photography',
    localText: 'Delivering refined photography services across Switzerland\'s luxury landscape.',
    services: ['Luxury Brand Photography', 'Alpine Fashion Shoots', 'International Editorial', 'Premium Campaigns']
  },
  'malta': {
    name: 'Malta',
    region: 'Malta',
    country: 'Malta',
    title: 'International Fashion Photographer Malta | Jeff Honforloco',
    description: 'Luxury fashion and beauty photographer available in Malta. Mediterranean elegance meets international photography excellence.',
    keywords: 'fashion photographer Malta, luxury photographer Mediterranean, beauty photographer Malta, international photographer Malta',
    localText: 'Capturing Mediterranean beauty and luxury in Malta\'s stunning coastal settings.',
    services: ['Mediterranean Fashion', 'Luxury Photography', 'International Editorial', 'Destination Shoots']
  },
  'monaco': {
    name: 'Monaco',
    region: 'Monaco',
    country: 'Monaco',
    title: 'Elite Fashion Photographer Monaco | Jeff Honforloco Photography',
    description: 'Premier luxury fashion and beauty photographer in Monaco. Exclusive photography services for the world\'s most discerning clientele.',
    keywords: 'fashion photographer Monaco, luxury photographer Monte Carlo, elite photographer Monaco, exclusive fashion photography',
    localText: 'Serving Monaco\'s exclusive luxury market with unparalleled photography excellence.',
    services: ['Exclusive Fashion Photography', 'Luxury Campaigns', 'Elite Portraits', 'International Projects']
  }
};

const LocationLanding = () => {
  const { location } = useParams<{ location: string }>();
  
  // Get location info, with fallback to prevent crashes
  const locationInfo = location && locationData[location as keyof typeof locationData] 
    ? locationData[location as keyof typeof locationData]
    : null;

  // Update page title and meta on mount
  useEffect(() => {
    if (locationInfo) {
      document.title = locationInfo.title;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', locationInfo.description);
      }

      // Update meta keywords
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', locationInfo.keywords);
      }

      // Track page view
      if (typeof window !== 'undefined' && (window as { gtag?: (...args: unknown[]) => void }).gtag) {
        window.gtag('event', 'page_view', {
          page_title: locationInfo.title,
          page_location: window.location.href,
          location_name: locationInfo.name
        });
      }
    }
  }, [locationInfo]);

  // Redirect if location is not supported (after hooks)
  if (!locationInfo) {
    return <Navigate to="/not-found" replace />;
  }

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden bg-black">
        <HeroSection />
        
        {/* Location-specific overlay content */}
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
          <div className="text-center bg-black/60 backdrop-blur-sm p-8 rounded-lg max-w-4xl mx-4">
            <h1 className="font-playfair text-4xl lg:text-6xl font-light text-white mb-4 tracking-wider">
              Luxury Photography in {locationInfo.name}
            </h1>
            <p className="font-inter text-lg lg:text-xl text-gray-200 mb-6 leading-relaxed">
              {locationInfo.localText}
            </p>
            <div className="flex flex-wrap gap-4 justify-center mb-8">
              {locationInfo.services.map((service, index) => (
                <span key={index} className="bg-photo-red/20 text-white px-4 py-2 rounded-full text-sm">
                  {service}
                </span>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
              <a 
                href="/contact" 
                className="bg-photo-red hover:bg-photo-red-hover text-white px-8 py-4 font-semibold tracking-wider uppercase text-sm transition-all duration-300 hover:scale-105 rounded-lg shadow-2xl"
              >
                Book in {locationInfo.name}
              </a>
              <a 
                href="/portfolios" 
                className="border-2 border-white/80 text-white hover:bg-white/10 px-8 py-4 font-semibold tracking-wider uppercase text-sm transition-all duration-300 hover:scale-105 rounded-lg backdrop-blur-sm"
              >
                View Portfolio
              </a>
            </div>
          </div>
        </div>
      </div>
      <FeaturedWork />
      <AboutPreview />
      <Recognition />
    </Layout>
  );
};

export default LocationLanding;