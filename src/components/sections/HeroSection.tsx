
import { HeroImageGrid, HeroContent, HeroSEO } from './hero';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-black">
      <HeroSEO />
      <HeroImageGrid />
      <HeroContent />
    </section>
  );
};

export default HeroSection;
