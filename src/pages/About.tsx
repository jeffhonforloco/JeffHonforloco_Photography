import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

const stats = [
  { value: '10+', label: 'Years Behind the Lens' },
  { value: '500+', label: 'Sessions Delivered' },
  { value: '5.0', label: 'Google Rating' },
  { value: 'US & Intl', label: 'We Travel for the Right Project' },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="min-h-screen bg-photo-black text-white pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto px-8 md:px-16 py-20 md:py-28">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left — Text */}
            <div className="order-2 lg:order-1 lg:pt-8">
              <p className="font-inter text-xs tracking-[0.4em] text-photo-red uppercase mb-6">About Jeff</p>
              <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-extralight tracking-wide text-white mb-10 leading-tight">
                Photographer,<br />
                Creative,<br />
                <span className="text-photo-red">Entrepreneur.</span>
              </h1>

              <div className="space-y-6 font-inter font-light text-gray-300 text-base md:text-lg leading-relaxed">
                <p>
                  Jeff Honforloco is a fashion, beauty, and editorial photographer based in Providence, Rhode Island, with a client list that spans models, agencies, brands, and individuals across the United States and internationally.
                </p>
                <p>
                  His work is built on a single conviction: that every person has imagery waiting inside them — something that's true, powerful, and worth capturing on camera. Jeff's job is to find it. That means understanding your vision before the shoot, building the environment where you feel like yourself, and then making the picture that proves it.
                </p>
                <p>
                  Over more than a decade, Jeff has photographed runway shows in Rhode Island, editorial campaigns for brands, beauty portraits for makeup artists, weddings across the country, and everything in between. He is known for his precision, his warmth on set, and for delivering images that clients describe as better than they imagined.
                </p>
                <p>
                  He is also a creative entrepreneur — working in partnership with urs79.com to extend the visual experience into motion content, and operating as a full-service creative studio for clients who need more than a photographer.
                </p>
              </div>

              <blockquote className="mt-12 pt-10 border-t border-photo-gray-700">
                <p className="font-playfair text-xl md:text-2xl italic font-light text-gray-300 leading-relaxed">
                  "A well-captured image represents a moment in time that is expressed infinitely."
                </p>
                <cite className="block mt-4 font-inter text-sm text-gray-500 not-italic tracking-widest uppercase">
                  — Jeff Honforloco
                </cite>
              </blockquote>
            </div>

            {/* Right — Image */}
            <div className="order-1 lg:order-2">
              <div className="relative">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src="/images/be7f5d35-71c0-4752-8fbe-46cd1a9e1fdd.png"
                    alt="Jeff Honforloco, photographer"
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 border border-photo-red/30" />
                <div className="absolute -top-4 -right-4 w-24 h-24 border border-photo-red/30" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-photo-gray-900 border-t border-photo-gray-800">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-playfair text-4xl md:text-5xl font-extralight text-white mb-2">{stat.value}</p>
                <p className="font-inter text-xs text-gray-500 tracking-widest uppercase leading-relaxed">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-32 md:py-40 bg-photo-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-photo-gray-900/20 to-photo-black" />
        <div className="relative max-w-7xl mx-auto px-8 md:px-16">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <p className="font-inter text-xs tracking-[0.4em] text-photo-red uppercase mb-4">The Approach</p>
              <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-extralight tracking-wide text-white mb-8 leading-tight">
                Vision First,<br />Camera Second.
              </h2>
              <div className="w-16 h-px bg-photo-red mb-10" />
              <div className="space-y-5 font-inter font-light text-gray-300 text-base leading-relaxed">
                <p>
                  Jeff doesn't pick up the camera until he understands what you're trying to say. Every session starts with a conversation about purpose: what these images are for, who will see them, and what they need to make you feel.
                </p>
                <p>
                  On set, the environment is calm and intentional. Jeff works quickly and quietly, adjusting light and direction in real time — so clients spend less time waiting and more time being photographed at their best.
                </p>
                <p>
                  The result is a gallery that doesn't need to be explained. You'll know the moment you see it.
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {[
                { title: 'Before the Shoot', body: 'A creative consult where Jeff aligns on concept, location, wardrobe, and direction. No guessing.' },
                { title: 'On Set', body: 'Professional, calm, and efficient. Jeff guides the session so you can focus on being in it.' },
                { title: 'After Delivery', body: 'Gallery-ready, fully retouched images ready for whatever you create next.' },
              ].map((item) => (
                <div key={item.title} className="bg-photo-gray-900 border border-photo-gray-700 rounded-2xl p-8">
                  <h3 className="font-playfair text-xl font-light text-white mb-3">{item.title}</h3>
                  <p className="font-inter font-light text-gray-400 text-sm leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video — Behind the Lens */}
      {(() => {
        let behindLensVideo = null;
        try {
          const motionItems = JSON.parse(localStorage.getItem('motionItems') || '[]');
          behindLensVideo = motionItems.find((item: { isBehindLens?: boolean }) => item.isBehindLens) ?? null;
        } catch {
          behindLensVideo = null;
        }

        if (!behindLensVideo) return null;

        return (
          <section className="py-20 md:py-32 bg-photo-gray-900">
            <div className="max-w-6xl mx-auto px-8 md:px-16">
              <div className="text-center mb-16">
                <p className="font-inter text-xs tracking-[0.4em] text-photo-red uppercase mb-4">Process</p>
                <h2 className="font-playfair text-4xl md:text-5xl font-extralight tracking-wide text-white">Behind the Lens</h2>
              </div>
              <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-photo-gray-700">
                {behindLensVideo.isYouTube ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${behindLensVideo.youTubeId}`}
                    title={behindLensVideo.alt}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <video controls className="w-full h-full object-cover" poster={behindLensVideo.thumbnail}>
                    <source src={behindLensVideo.src} type="video/mp4" />
                  </video>
                )}
              </div>
            </div>
          </section>
        );
      })()}

      {/* CTA */}
      <section className="py-32 bg-photo-black border-t border-photo-gray-800">
        <div className="max-w-3xl mx-auto px-8 md:px-16 text-center">
          <p className="font-inter text-xs tracking-[0.4em] text-photo-red uppercase mb-4">Work Together</p>
          <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-extralight tracking-wide text-white mb-8 leading-tight">
            Ready When You Are
          </h2>
          <p className="font-inter font-light text-gray-400 leading-relaxed mb-10 text-lg">
            Book a session or view the full portfolio to see what's possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book"
              className="inline-block bg-photo-red hover:bg-photo-red-hover text-white px-12 py-4 font-inter font-medium tracking-[0.2em] uppercase text-sm transition-all duration-300 hover:scale-105"
            >
              Book Your Session
            </Link>
            <Link
              to="/portfolios"
              className="inline-block border border-white/20 hover:border-white/50 text-white px-12 py-4 font-inter font-medium tracking-[0.2em] uppercase text-sm transition-all duration-300"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
