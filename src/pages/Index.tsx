import Layout from '../components/Layout';
import HeroSection from '../components/sections/HeroSection';
import FeaturedWork from '../components/sections/FeaturedWork';
import GoogleReviews from '../components/sections/GoogleReviews';
import ProcessSection from '../components/sections/ProcessSection';
import EmailSignup from '../components/EmailSignup';
import SEO from '../components/SEO';
import LocalServiceLinks from '../components/sections/LocalServiceLinks';

const Index = () => {
  return (
    <Layout>
      <SEO />
      <HeroSection />
      <FeaturedWork />
      <GoogleReviews />
      <LocalServiceLinks />
      <ProcessSection />
      <EmailSignup />
    </Layout>
  );
};

export default Index;
