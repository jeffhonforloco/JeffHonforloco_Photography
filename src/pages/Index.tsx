
import Layout from '../components/Layout';
import HeroSection from '../components/sections/HeroSection';
import EmailSignup from '../components/EmailSignup';
import SEO from '../components/SEO';

const Index = () => {
  return (
    <Layout>
      <SEO />
      <HeroSection />
      <EmailSignup />
    </Layout>
  );
};

export default Index;
