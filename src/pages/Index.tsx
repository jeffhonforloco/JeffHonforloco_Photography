import Layout from '../components/Layout';
import HeroSection from '../components/sections/HeroSection';
import FeaturedWork from '../components/sections/FeaturedWork';
import ProcessSection from '../components/sections/ProcessSection';
import EmailSignup from '../components/EmailSignup';
import SEO from '../components/SEO';

const Index = () => {
  return (
    <Layout>
      <SEO />
      <HeroSection />
      <FeaturedWork />
      <ProcessSection />
      <EmailSignup />
    </Layout>
  );
};

export default Index;
