import Layout from '../components/Layout';
import HeroSection from '../components/sections/HeroSection';
import FeaturedWork from '../components/sections/FeaturedWork';
import GoogleReviews from '../components/sections/GoogleReviews';
import ProcessSection from '../components/sections/ProcessSection';
import FaqSection from '../components/sections/FaqSection';
import EmailSignup from '../components/EmailSignup';
import LocalServiceLinks from '../components/sections/LocalServiceLinks';

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <FeaturedWork />
      <GoogleReviews />
      <LocalServiceLinks />
      <ProcessSection />
      <FaqSection />
      <EmailSignup />
    </Layout>
  );
};

export default Index;
