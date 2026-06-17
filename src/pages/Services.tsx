import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Camera, Award, Users, Smartphone, Film, ArrowRight } from 'lucide-react';

const services = [
  {
    id: 'fashion',
    icon: Camera,
    name: 'Fashion Photography',
    tagline: 'For models, influencers, designers & creative brands',
    description:
      'Editorial-driven fashion photography that tells a story. Whether you\'re building your model portfolio, launching a collection, or creating campaign content for your brand, Jeff brings creative direction, precise lighting, and an eye for movement that makes fashion images stand out.',
    forWho: ['Models building or updating their book', 'Fashion designers & clothing brands', 'Influencers & content creators', 'Stylists & creative agencies'],
    includes: ['Full creative direction & mood board alignment', 'Professional lighting setup', 'Multiple looks per session', 'High-res retouched gallery delivered in 7–10 days'],
    duration: '2–8 hours',
    startingAt: '$499',
    bookId: 'fashion',
  },
  {
    id: 'beauty',
    icon: Award,
    name: 'Beauty Photography',
    tagline: 'Portraits that honor every detail',
    description:
      'Jeff\'s beauty work is rooted in a deep appreciation for the human face — the texture, light, and expression that make each person unique. These sessions are ideal for personal branding, cosmetic brands, and anyone who wants imagery that feels polished, elevated, and true.',
    forWho: ['Personal brand portraits', 'Cosmetics & skincare brands', 'Makeup artists & beauty professionals', 'Actors & entertainers'],
    includes: ['Studio or on-location setup', 'Collaboration with MUA if needed', 'Skin retouching with detail preservation', 'Gallery-ready images in multiple formats'],
    duration: '1–5 hours',
    startingAt: '$499',
    bookId: 'beauty',
  },
  {
    id: 'headshots',
    icon: Smartphone,
    name: 'Headshots & Portraits',
    tagline: 'Studio or mobile — individuals, teams & LinkedIn',
    description:
      'A great headshot opens doors. Whether for LinkedIn, a talent agency submission, a corporate team page, or a personal website, Jeff delivers headshots that look authoritative, approachable, and unmistakably you — not a generic corporate photo.',
    forWho: ['Executives & business professionals', 'Actors & talent agency submissions', 'Teams & company directories', 'Anyone updating their online presence'],
    includes: ['Mobile or studio options available', 'Multiple wardrobe looks', 'Same-day preview selects', 'Retouched finals delivered within 5 days'],
    duration: '1–3 hours',
    startingAt: '$499',
    bookId: 'headshots',
    isMobile: true,
  },
  {
    id: 'glamour',
    icon: Camera,
    name: 'Glamour Photography',
    tagline: 'Dramatic, bold, unforgettable',
    description:
      'High-drama lighting, editorial styling, and the kind of confidence you didn\'t know you had until you see the image. Glamour sessions are about revealing a side of yourself that\'s powerful and magnetic — whether that\'s for personal celebration, a gift, or a milestone.',
    forWho: ['Personal milestone celebrations', 'Boudoir & empowerment portraits', 'Entertainment & artist promo shots', 'Anyone wanting a transformative experience'],
    includes: ['Creative lighting design', 'Styling & posing guidance throughout', 'Multiple looks', 'Curated retouched gallery'],
    duration: '1–4 hours',
    startingAt: '$499',
    bookId: 'glamour',
  },
  {
    id: 'editorial',
    icon: Camera,
    name: 'Editorial Photography',
    tagline: 'Magazine-quality storytelling for publications & brands',
    description:
      'Editorial photography is concept-first. Jeff works with you to develop a visual narrative — location, wardrobe, props, and direction — that reads as a cohesive story. The result is imagery built for publications, brand campaigns, or portfolio centerpieces.',
    forWho: ['Magazine & publication submissions', 'Brand campaign content', 'Creative directors & art directors', 'Established models building a conceptual book'],
    includes: ['Full concept development & mood board', 'Location scouting or studio coordination', 'Art direction on set', 'Post-production & retouching'],
    duration: '4–8 hours',
    startingAt: '$499',
    bookId: 'editorial',
  },
  {
    id: 'lifestyle',
    icon: Users,
    name: 'Lifestyle Photography',
    tagline: 'Authentic moments — individuals, couples & families',
    description:
      'Life is worth capturing. Lifestyle sessions are relaxed, documentary-style shoots that follow you in your environment — your home, neighborhood, a meaningful location. The goal is real moments that feel alive, not posed.',
    forWho: ['Couples & families', 'Personal brand storytelling', 'Small businesses & entrepreneurs', 'Maternity & milestone moments'],
    includes: ['On-location, natural light preferred', 'Relaxed direction that draws out genuine moments', 'Full gallery of selects', 'Print-ready files included'],
    duration: '1–4 hours',
    startingAt: '$499',
    bookId: 'lifestyle',
  },
  {
    id: 'wedding',
    icon: Award,
    name: 'Wedding & Engagements',
    tagline: 'From intimate elopements to full-day celebrations',
    description:
      'Jeff photographs weddings the same way he approaches editorial work — with intention and attention to every detail, from the quiet moments to the big ones. Available across the US, with packages that cover everything from engagement shoots to full-day coverage.',
    forWho: ['Engaged couples planning their day', 'Elopements & intimate ceremonies', 'Destination weddings', 'Couples wanting editorial-style coverage'],
    includes: ['Pre-shoot consultation & timeline planning', 'Engagement session available as add-on', 'Full day or partial day coverage', 'Online gallery delivered within 3–4 weeks'],
    duration: '2.5–10 hours',
    startingAt: '$850',
    bookId: 'wedding',
  },
  {
    id: 'events',
    icon: Users,
    name: 'Events & Celebrations',
    tagline: 'Sweet sixteens, galas, corporate events & milestones',
    description:
      'Events move fast. Jeff is trained to capture the energy of a room — the speeches, the dancing, the candid moments between guests — without disrupting the flow. Every major moment gets documented. Every image is delivery-ready.',
    forWho: ['Corporate events & conferences', 'Sweet sixteens & quinceañeras', 'Galas & charity events', 'Brand launches & product reveals'],
    includes: ['Candid & directed coverage', 'Group shots coordinated on your schedule', 'Full gallery delivered within 7 days', 'Rush delivery available'],
    duration: '2–8 hours',
    startingAt: '$799',
    bookId: 'events',
  },
  {
    id: 'real-estate',
    icon: Smartphone,
    name: 'Real Estate Photography',
    tagline: 'We come to the property — anywhere in the US',
    description:
      'Properties that are photographed well sell faster and command higher prices. Jeff delivers crisp, well-lit real estate images that show spaces at their absolute best — for listings, architecture portfolios, and hospitality brands.',
    forWho: ['Real estate agents & brokers', 'Architects & interior designers', 'Airbnb & short-term rental hosts', 'Hotels & boutique properties'],
    includes: ['Interior & exterior photography', 'Twilight shots available', 'Wide-angle compositions', 'Delivered within 48 hours of shoot'],
    duration: 'Up to 3 hours',
    startingAt: '$499',
    bookId: 'real-estate',
    isMobile: true,
  },
  {
    id: 'motion',
    icon: Film,
    name: 'Motion & Video',
    tagline: 'Social reels to full brand productions',
    description:
      'In partnership with urs79.com, Jeff offers motion content that extends the still photography experience into video. From 60-second Instagram reels to full brand films, the motion work shares the same visual language as the photography — cohesive, intentional, striking.',
    forWho: ['Brands building social content', 'Musicians & artists', 'Businesses launching campaigns', 'Influencers investing in long-form content'],
    includes: ['Concept & scripting support', 'On-set direction', 'Color grading & editing', 'Delivered in multiple formats for all platforms'],
    duration: '2–4 hr shoot+',
    startingAt: '$1,500',
    bookId: 'motion',
    isMotion: true,
  },
];

const Services = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-photo-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-photo-gray-900/30 to-photo-black" />
        <div className="relative max-w-7xl mx-auto px-8 md:px-16 text-center">
          <p className="font-inter text-xs tracking-[0.4em] text-photo-red uppercase mb-4">
            What We Offer
          </p>
          <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl font-extralight tracking-wide text-white mb-8 leading-tight">
            Photography Services
          </h1>
          <p className="font-inter font-light text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            Every service is built around one goal: imagery that works for you — in your portfolio, your feed, your campaign, or on your wall.
          </p>
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-photo-red to-transparent mx-auto" />
        </div>
      </section>

      {/* Services */}
      <section className="bg-photo-black pb-32">
        <div className="max-w-7xl mx-auto px-8 md:px-16 space-y-28">
          {services.map((service, idx) => {
            const Icon = service.icon;
            const isEven = idx % 2 === 1;

            return (
              <div
                key={service.id}
                className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-start border-t border-photo-gray-800 pt-16 ${isEven ? 'lg:grid-flow-dense' : ''}`}
              >
                {/* Text */}
                <div className={isEven ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center gap-3 mb-5">
                    <Icon className="w-5 h-5 text-photo-red flex-shrink-0" />
                    {service.isMobile && (
                      <span className="text-[10px] tracking-widest uppercase text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full">Mobile</span>
                    )}
                    {service.isMotion && (
                      <span className="text-[10px] tracking-widest uppercase text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">urs79.com</span>
                    )}
                  </div>
                  <h2 className="font-playfair text-4xl md:text-5xl font-light text-white mb-3 leading-tight">
                    {service.name}
                  </h2>
                  <p className="font-inter text-photo-red text-sm tracking-wide mb-6">{service.tagline}</p>
                  <p className="font-inter font-light text-gray-300 leading-relaxed mb-8 text-base">
                    {service.description}
                  </p>

                  <div className="flex gap-6 text-sm mb-8">
                    <div>
                      <p className="text-gray-600 text-xs uppercase tracking-widest mb-1">Duration</p>
                      <p className="text-white font-medium">{service.duration}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs uppercase tracking-widest mb-1">Starting At</p>
                      <p className="text-photo-red font-semibold">{service.startingAt}</p>
                    </div>
                  </div>

                  <Link
                    to={`/book?service=${service.bookId}`}
                    className="inline-flex items-center gap-2 bg-photo-red hover:bg-photo-red-hover text-white px-8 py-3.5 font-inter font-medium tracking-[0.15em] uppercase text-xs transition-all duration-300 hover:scale-105"
                  >
                    Book This Session
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Details panel */}
                <div className={`space-y-6 ${isEven ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
                  <div className="bg-photo-gray-900 border border-photo-gray-700 rounded-2xl p-8">
                    <p className="text-xs tracking-[0.3em] text-photo-red uppercase font-semibold mb-5">Who It's For</p>
                    <ul className="space-y-3">
                      {service.forWho.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed">
                          <span className="w-1 h-1 rounded-full bg-photo-red flex-shrink-0 mt-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-photo-gray-900 border border-photo-gray-700 rounded-2xl p-8">
                    <p className="text-xs tracking-[0.3em] text-photo-red uppercase font-semibold mb-5">What's Included</p>
                    <ul className="space-y-3">
                      {service.includes.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed">
                          <span className="w-1 h-1 rounded-full bg-photo-red flex-shrink-0 mt-2" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 bg-photo-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-photo-black/60 to-photo-gray-900" />
        <div className="relative max-w-3xl mx-auto px-8 md:px-16 text-center">
          <p className="font-inter text-xs tracking-[0.4em] text-photo-red uppercase mb-4">Ready to Start?</p>
          <h2 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-extralight tracking-wide text-white mb-8 leading-tight">
            Let's Create Something Worth Keeping
          </h2>
          <p className="font-inter font-light text-gray-400 leading-relaxed mb-10">
            Not sure which service is right for you? Book a session and we'll figure it out together in the creative consult.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book"
              className="inline-block bg-photo-red hover:bg-photo-red-hover text-white px-12 py-4 font-inter font-medium tracking-[0.2em] uppercase text-sm transition-all duration-300 hover:scale-105"
            >
              Book Your Session
            </Link>
            <Link
              to="/pricing"
              className="inline-block border border-white/20 hover:border-white/50 text-white px-12 py-4 font-inter font-medium tracking-[0.2em] uppercase text-sm transition-all duration-300"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
