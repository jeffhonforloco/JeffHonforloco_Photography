
import Layout from '../components/Layout';
import HeroSection from '../components/sections/HeroSection';
import PricingPreview from '../components/sections/PricingPreview';
import EmailSignup from '../components/EmailSignup';
import SEO from '../components/SEO';

const Index = () => {
  return (
    <Layout>
      <SEO />
      <HeroSection />
      <PricingPreview />
      <EmailSignup />
    </Layout>
  );
};

export default Index;
