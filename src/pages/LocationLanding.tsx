import { useParams, useLocation, Navigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '../components/Layout';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

type LocationConfig = {
  name: string;
  region: string;
  country: string;
  title: string;
  description: string;
  keywords: string;
  headline: string;
  subheadline: string;
  body: string[];
  services: string[];
  cta: string;
};

const locationData: Record<string, LocationConfig> = {
  'nyc': {
    name: 'New York City',
    region: 'New York',
    country: 'USA',
    title: 'Fashion & Beauty Photographer NYC | Jeff Honforloco',
    description: 'Fashion, beauty, and editorial photographer serving New York City. High-end photography for brands, models, and individuals in Manhattan, Brooklyn, and across the five boroughs.',
    keywords: 'fashion photographer NYC, beauty photographer New York, editorial photographer Manhattan, portrait photographer Brooklyn, commercial photographer New York City',
    headline: 'New York City',
    subheadline: 'Fashion, Beauty & Editorial Photography',
    body: [
      'New York is where ambition meets art — and where great photography can change the direction of a career. Jeff Honforloco has photographed fashion shoots, beauty campaigns, editorial spreads, and portraits across New York City, from loft studios in Manhattan to rooftops in Brooklyn.',
      'Whether you\'re a model building your book, a brand launching a campaign, or an individual who wants imagery that matches your NYC energy, Jeff brings the creative direction and technical precision to make it happen.',
      'Available for single-day sessions and multi-day productions throughout the five boroughs and the greater New York area.',
    ],
    services: ['Fashion Campaigns', 'Beauty Editorials', 'Portrait Sessions', 'Brand Photography', 'Headshots', 'Events'],
    cta: 'Book in New York',
  },
  'rhode-island': {
    name: 'Rhode Island',
    region: 'New England',
    country: 'USA',
    title: 'Photographer Rhode Island | Jeff Honforloco Photography',
    description: 'Jeff Honforloco is a Providence-based photographer offering fashion, beauty, portrait, and event photography across Rhode Island — including Providence, Newport, and Bristol County.',
    keywords: 'photographer Rhode Island, fashion photographer Providence, beauty photographer RI, portrait photographer Newport, photographer Providence RI',
    headline: 'Rhode Island',
    subheadline: 'Based in Providence — Available Statewide',
    body: [
      'Jeff Honforloco is headquartered in Providence, Rhode Island, where he has photographed runway shows, beauty campaigns, model portfolios, editorial spreads, and events throughout the state.',
      'From the runways of STYLEWEEK Providence to portrait sessions in Newport to corporate events across Bristol County, Jeff knows Rhode Island\'s creative scene from the inside. His clients here range from local models and small businesses to regional agencies and established brands.',
      'If you\'re in Rhode Island and want photography that reflects real professionalism — not a side hustle — this is where to start.',
    ],
    services: ['Model Portfolios', 'Beauty Photography', 'Event Photography', 'Brand Photography', 'Headshots', 'Fashion Runway'],
    cta: 'Book in Rhode Island',
  },
  'massachusetts': {
    name: 'Massachusetts',
    region: 'New England',
    country: 'USA',
    title: 'Fashion & Portrait Photographer Massachusetts | Jeff Honforloco',
    description: 'Fashion, beauty, and portrait photographer serving Massachusetts — including Boston, Worcester, and the South Shore. Based in Providence RI, available across New England.',
    keywords: 'fashion photographer Massachusetts, photographer Boston, portrait photographer Worcester, beauty photographer MA, commercial photographer New England',
    headline: 'Massachusetts',
    subheadline: 'Photography Across the Bay State',
    body: [
      'Based in neighboring Providence, Jeff Honforloco regularly serves clients across Massachusetts — from fashion shoots and beauty sessions in Boston to portrait sessions and brand photography throughout the state.',
      'Massachusetts is home to some of New England\'s strongest creative and business communities, and Jeff brings the same level of precision and creative direction to every Massachusetts project as he does to his full-scale productions.',
      'Available for travel throughout Massachusetts for single-session bookings and multi-location projects.',
    ],
    services: ['Portrait Photography', 'Fashion Photography', 'Beauty Photography', 'Brand Campaigns', 'Headshots', 'Events'],
    cta: 'Book in Massachusetts',
  },
  'maine': {
    name: 'Maine',
    region: 'New England',
    country: 'USA',
    title: 'Photographer Maine | Jeff Honforloco Photography',
    description: 'Fashion, lifestyle, and portrait photographer available in Maine. Jeff Honforloco travels from Providence RI for portrait sessions, lifestyle shoots, and brand photography across Maine.',
    keywords: 'photographer Maine, fashion photographer Portland ME, lifestyle photographer Maine, portrait photographer New England, beauty photographer Maine',
    headline: 'Maine',
    subheadline: 'Destination Sessions & Lifestyle Photography',
    body: [
      'Maine\'s coastlines, forests, and quiet small cities make it one of the most compelling on-location shooting destinations in the Northeast. Jeff Honforloco travels to Maine for destination lifestyle sessions, fashion editorials, and portrait work.',
      'Whether you want a coastal lifestyle shoot in Portland, a nature-forward fashion editorial along the Maine coast, or a portrait session that takes advantage of Maine\'s extraordinary natural light, Jeff can plan and execute it.',
      'Contact to discuss travel availability and to start planning your Maine session.',
    ],
    services: ['Lifestyle Photography', 'On-Location Portraits', 'Fashion Editorials', 'Destination Shoots', 'Brand Photography'],
    cta: 'Book in Maine',
  },
  'connecticut': {
    name: 'Connecticut',
    region: 'New England',
    country: 'USA',
    title: 'Photographer Connecticut | Jeff Honforloco Photography',
    description: 'Fashion, beauty, and portrait photographer serving Connecticut — including Hartford, New Haven, and Stamford. Based in Providence RI, available across New England.',
    keywords: 'photographer Connecticut, fashion photographer Hartford, portrait photographer New Haven, beauty photographer CT, commercial photographer Stamford',
    headline: 'Connecticut',
    subheadline: 'Photography from Hartford to the Coast',
    body: [
      'Connecticut sits at the intersection of New England character and metropolitan energy — and it\'s a natural market for Jeff Honforloco\'s work. Based in Providence, Jeff travels regularly to Connecticut for fashion, beauty, portrait, and corporate sessions.',
      'From executive headshots in Stamford to editorial fashion in New Haven, Jeff brings full creative direction, professional equipment, and a track record of delivering images that clients describe as exceeding expectations.',
      'Available for sessions across Connecticut — contact to check availability and schedule a consultation.',
    ],
    services: ['Headshots & Portraits', 'Beauty Photography', 'Fashion Photography', 'Corporate Events', 'Brand Photography'],
    cta: 'Book in Connecticut',
  },
  'los-angeles': {
    name: 'Los Angeles',
    region: 'California',
    country: 'USA',
    title: 'Fashion & Beauty Photographer Los Angeles | Jeff Honforloco',
    description: 'Fashion, beauty, and editorial photographer serving Los Angeles. Jeff Honforloco travels to LA for brand campaigns, celebrity portraits, model portfolios, and editorial shoots.',
    keywords: 'fashion photographer Los Angeles, beauty photographer LA, editorial photographer Hollywood, celebrity photographer California, brand photographer Los Angeles',
    headline: 'Los Angeles',
    subheadline: 'Fashion, Beauty & Celebrity Photography',
    body: [
      'Los Angeles is a city built on image — and the photographers who work here have to match that standard. Jeff Honforloco travels to LA for fashion campaigns, beauty editorials, celebrity portraits, and brand shoots that need a creative director who understands what premium looks like.',
      'His work has a distinctly editorial quality that translates well in the LA market: clean, intentional, high-fashion without being stiff. Whether you\'re shooting for a brand, a portfolio, or a publication, Jeff brings the same level of preparation and execution.',
      'Available for LA sessions on a scheduled travel basis — reach out early to lock in dates.',
    ],
    services: ['Celebrity Photography', 'Fashion Campaigns', 'Beauty Editorials', 'Brand Photography', 'Model Portfolios', 'Lifestyle'],
    cta: 'Book in Los Angeles',
  },
  'miami': {
    name: 'Miami',
    region: 'Florida',
    country: 'USA',
    title: 'Fashion & Beauty Photographer Miami | Jeff Honforloco',
    description: 'Fashion, beauty, and editorial photographer serving Miami and South Florida. Jeff Honforloco travels to Miami for brand campaigns, lifestyle shoots, and editorial photography.',
    keywords: 'fashion photographer Miami, beauty photographer Miami Beach, editorial photographer South Beach, lifestyle photographer Florida, brand photographer Miami',
    headline: 'Miami',
    subheadline: 'Editorial & Lifestyle Photography',
    body: [
      'Miami is one of the most visually rich cities in the US — and some of Jeff\'s most striking work has been shot here. The mix of natural light, architecture, and the city\'s inherent sense of style creates the perfect conditions for fashion, lifestyle, and editorial photography.',
      'Jeff travels to Miami for brand campaigns, swimwear and resort fashion, beauty sessions, and lifestyle shoots that take full advantage of what the city offers. Whether that\'s South Beach at golden hour or a studio session in Wynwood, Jeff knows how to use the location.',
      'Miami availability fills up — contact early to discuss dates and project scope.',
    ],
    services: ['Resort & Swimwear Fashion', 'Lifestyle Photography', 'Beauty Photography', 'Brand Campaigns', 'Editorial Shoots', 'Events'],
    cta: 'Book in Miami',
  },
  'paris': {
    name: 'Paris',
    region: 'Île-de-France',
    country: 'France',
    title: 'Fashion Photographer Paris | Jeff Honforloco Photography',
    description: 'International fashion and editorial photographer available in Paris. Jeff Honforloco travels to Paris for Fashion Week coverage, haute couture campaigns, and editorial shoots.',
    keywords: 'fashion photographer Paris, editorial photographer France, haute couture photographer Paris, international photographer Paris, Fashion Week photographer',
    headline: 'Paris',
    subheadline: 'International Fashion Photography',
    body: [
      'Paris is the standard by which all fashion photography is measured. Jeff Honforloco travels to Paris for Fashion Week shoots, editorial campaigns, and luxury brand projects that require a photographer who works at an international level.',
      'His editorial approach — concept-first, technically precise, visually distinctive — is built for the Paris market. Clients who have worked with Jeff in other cities bring him to Paris for projects that need that same standard applied in the world\'s most demanding fashion environment.',
      'Paris availability is limited and booked well in advance. Contact to discuss your project and timeline.',
    ],
    services: ['Fashion Week Photography', 'Haute Couture Campaigns', 'Editorial Shoots', 'International Brand Projects', 'Runway Coverage'],
    cta: 'Book in Paris',
  },
  'london': {
    name: 'London',
    region: 'England',
    country: 'United Kingdom',
    title: 'Fashion & Beauty Photographer London | Jeff Honforloco',
    description: 'International fashion and beauty photographer serving London. Jeff Honforloco travels to London for editorial campaigns, brand photography, and Fashion Week shoots.',
    keywords: 'fashion photographer London, beauty photographer UK, editorial photographer England, international photographer London, brand photographer United Kingdom',
    headline: 'London',
    subheadline: 'Editorial & Brand Photography',
    body: [
      'London\'s creative industry is one of the most demanding in the world — and one of the most rewarding to work in. Jeff Honforloco travels to London for editorial projects, brand campaigns, beauty shoots, and Fashion Week work.',
      'The UK market values photography that has a clear point of view and technical credibility. Jeff\'s work delivers both: every project starts with creative alignment and ends with imagery that needs no explanation.',
      'London projects are booked on a scheduled international travel basis. Contact to discuss your project and available dates.',
    ],
    services: ['Editorial Photography', 'Fashion Campaigns', 'Beauty Photography', 'Brand Projects', 'Fashion Week'],
    cta: 'Book in London',
  },
  'italy': {
    name: 'Italy',
    region: 'Multiple Regions',
    country: 'Italy',
    title: 'Fashion Photographer Italy | Jeff Honforloco Photography',
    description: 'International fashion and editorial photographer available in Italy — Milan, Rome, and beyond. Jeff Honforloco travels to Italy for brand campaigns and editorial photography.',
    keywords: 'fashion photographer Italy, photographer Milan, editorial photographer Rome, international photographer Italy, brand photographer Milan',
    headline: 'Italy',
    subheadline: 'Fashion & Editorial Photography',
    body: [
      'From Milan\'s fashion districts to Rome\'s architectural grandeur, Italy offers some of the world\'s most extraordinary locations for fashion and editorial photography. Jeff Honforloco travels to Italy for brand campaigns, editorial shoots, and projects that require a backdrop as compelling as the subject.',
      'Jeff\'s editorial sensibility translates naturally to the Italian aesthetic — precise, intentional, and built to last. Whether the project is a Milan Fashion Week assignment or a location-based editorial in the Italian countryside, the standard is the same.',
      'Italian projects are planned in advance. Contact early to discuss your vision and secure dates.',
    ],
    services: ['Milan Fashion Week', 'Brand Campaigns', 'Editorial Photography', 'Location Shoots', 'International Projects'],
    cta: 'Book in Italy',
  },
  'lagos': {
    name: 'Lagos',
    region: 'Lagos State',
    country: 'Nigeria',
    title: 'Fashion & Beauty Photographer Lagos | Jeff Honforloco',
    description: 'International fashion and beauty photographer serving Lagos and West Africa. Jeff Honforloco travels to Lagos for editorial photography, brand campaigns, and contemporary fashion shoots.',
    keywords: 'fashion photographer Lagos, photographer Nigeria, beauty photographer West Africa, international photographer Lagos, brand photographer Nigeria',
    headline: 'Lagos',
    subheadline: 'Contemporary African Fashion Photography',
    body: [
      'Lagos is one of the most creatively energetic cities in the world — a market where fashion, music, culture, and entrepreneurship intersect at full speed. Jeff Honforloco travels to Lagos to work with brands, artists, and creatives who are building something that matters.',
      'His photography honors the specificity of Lagos\'s visual culture while bringing international production standards to every shoot. The result is imagery that works locally and globally — for brands with reach beyond West Africa as much as for those building their presence within it.',
      'Lagos projects are coordinated in advance. Contact to discuss your project, timeline, and goals.',
    ],
    services: ['Fashion Photography', 'Beauty Campaigns', 'Brand Photography', 'Editorial Shoots', 'Contemporary African Fashion'],
    cta: 'Book in Lagos',
  },
  'switzerland': {
    name: 'Switzerland',
    region: 'Multiple Cantons',
    country: 'Switzerland',
    title: 'Fashion Photographer Switzerland | Jeff Honforloco',
    description: 'International fashion and brand photographer available in Switzerland — Zurich, Geneva, and beyond. Jeff Honforloco travels to Switzerland for premium photography projects.',
    keywords: 'fashion photographer Switzerland, photographer Zurich, beauty photographer Geneva, international photographer Switzerland, brand photographer Swiss',
    headline: 'Switzerland',
    subheadline: 'Premium Brand & Editorial Photography',
    body: [
      'Switzerland\'s combination of precision, natural beauty, and global business reach makes it an excellent location for brand photography, fashion editorials, and portrait sessions. Jeff Honforloco travels to Switzerland for clients who need international-level photography in one of Europe\'s most visually distinctive countries.',
      'Whether it\'s a Zurich studio session for a financial brand, a luxury editorial in Geneva, or an outdoor fashion shoot in the Swiss Alps, Jeff brings the same creative rigor and technical excellence to every project.',
      'Swiss projects are booked on an international travel schedule. Contact to discuss scope and availability.',
    ],
    services: ['Brand Photography', 'Fashion Editorials', 'Portrait Sessions', 'Alpine Location Shoots', 'Corporate Photography'],
    cta: 'Book in Switzerland',
  },
  'malta': {
    name: 'Malta',
    region: 'Malta',
    country: 'Malta',
    title: 'International Fashion Photographer Malta | Jeff Honforloco',
    description: 'Fashion and editorial photographer available in Malta. Jeff Honforloco travels to Malta for destination fashion shoots, lifestyle photography, and editorial campaigns.',
    keywords: 'fashion photographer Malta, photographer Mediterranean, lifestyle photographer Malta, international photographer Malta, editorial photographer Mediterranean',
    headline: 'Malta',
    subheadline: 'Mediterranean Destination Photography',
    body: [
      'Malta\'s ancient architecture, crystal-clear water, and extraordinary Mediterranean light make it one of the most compelling destinations for editorial fashion and lifestyle photography. Jeff Honforloco travels to Malta for destination shoots that use the island\'s unique environment as an active creative element.',
      'Whether the brief is a high-fashion editorial against Malta\'s limestone cityscapes or a lifestyle shoot along the coast, Jeff arrives with a clear creative vision and the technical capability to execute it at the highest level.',
      'Malta projects are destination engagements planned well in advance. Contact to discuss your project.',
    ],
    services: ['Destination Fashion Shoots', 'Lifestyle Photography', 'Editorial Photography', 'Brand Campaigns', 'Location Portraits'],
    cta: 'Book in Malta',
  },
  'monaco': {
    name: 'Monaco',
    region: 'Monaco',
    country: 'Monaco',
    title: 'Fashion Photographer Monaco | Jeff Honforloco Photography',
    description: 'International fashion and portrait photographer serving Monaco. Jeff Honforloco travels to Monaco for high-end fashion campaigns, portraits, and editorial photography.',
    keywords: 'fashion photographer Monaco, photographer Monte Carlo, portrait photographer Monaco, international photographer Monaco, editorial photographer French Riviera',
    headline: 'Monaco',
    subheadline: 'High-End Fashion & Portrait Photography',
    body: [
      'Monaco operates at a standard most markets never reach. For clients here, photography isn\'t optional decoration — it\'s a core part of how they present themselves to the world. Jeff Honforloco travels to Monaco for clients who understand that distinction.',
      'His fashion and portrait work is built for exactly this kind of environment: technically flawless, creatively distinctive, and delivered with the kind of professionalism that Monaco clients expect. From Grand Prix weekend portraits to fashion campaigns on the Riviera, Jeff executes at the level the location demands.',
      'Monaco availability is extremely limited. Contact directly to discuss your project and confirm dates.',
    ],
    services: ['High-End Fashion Photography', 'Portrait Photography', 'Brand Campaigns', 'Event Photography', 'Editorial Shoots'],
    cta: 'Book in Monaco',
  },
};

// Map legacy path-based routes to location keys
const pathToKey: Record<string, string> = {
  '/nyc': 'nyc',
  '/los-angeles': 'los-angeles',
  '/miami': 'miami',
  '/paris': 'paris',
  '/london': 'london',
  '/italy': 'italy',
  '/lagos': 'lagos',
  '/switzerland': 'switzerland',
  '/malta': 'malta',
  '/monaco': 'monaco',
  '/rhode-island': 'rhode-island',
  '/massachusetts': 'massachusetts',
  '/maine': 'maine',
  '/connecticut': 'connecticut',
};

const LocationLanding = () => {
  const { location } = useParams<{ location: string }>();
  const { pathname } = useLocation();

  const locationKey = location ?? pathToKey[pathname] ?? null;
  const info = locationKey ? locationData[locationKey] ?? null : null;

  useEffect(() => {
    if (!info) return;
    document.title = info.title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', info.description);
    document.querySelector('meta[name="keywords"]')?.setAttribute('content', info.keywords);
    if (window.gtag) {
      window.gtag('event', 'page_view', { page_title: info.title, page_location: window.location.href });
    }
  }, [info]);

  if (!info) return <Navigate to="/not-found" replace />;

  return (
    <Layout>
      {/* Hero */}
      <section className="pt-32 pb-20 md:pt-44 md:pb-28 bg-photo-black relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-photo-gray-900/40 to-photo-black" />
        <div className="relative max-w-7xl mx-auto px-8 md:px-16">
          <p className="font-inter text-xs tracking-[0.4em] text-photo-red uppercase mb-4">
            {info.country}
          </p>
          <h1 className="font-playfair text-5xl md:text-6xl lg:text-8xl font-extralight tracking-wide text-white mb-4 leading-none">
            {info.headline}
          </h1>
          <p className="font-inter text-lg md:text-xl text-gray-400 font-light mb-10 tracking-wide">
            {info.subheadline}
          </p>
          <div className="w-20 h-px bg-photo-red mb-10" />
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/book"
              className="inline-block bg-photo-red hover:bg-photo-red-hover text-white px-10 py-4 font-inter font-medium tracking-[0.2em] uppercase text-sm transition-all duration-300 hover:scale-105"
            >
              {info.cta}
            </Link>
            <Link
              to="/portfolios"
              className="inline-block border border-white/20 hover:border-white/50 text-white px-10 py-4 font-inter font-medium tracking-[0.2em] uppercase text-sm transition-all duration-300"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* Body Copy */}
      <section className="py-24 md:py-32 bg-photo-black">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            <div className="space-y-6">
              {info.body.map((paragraph, i) => (
                <p key={i} className="font-inter font-light text-gray-300 text-base md:text-lg leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            <div>
              <p className="font-inter text-xs tracking-[0.3em] text-photo-red uppercase font-semibold mb-6">
                Services Available in {info.name}
              </p>
              <div className="grid grid-cols-2 gap-3">
                {info.services.map((service) => (
                  <div
                    key={service}
                    className="bg-photo-gray-900 border border-photo-gray-700 rounded-xl px-5 py-4 text-sm font-inter text-gray-300 font-light"
                  >
                    {service}
                  </div>
                ))}
              </div>

              <div className="mt-10 p-6 border border-photo-red/20 rounded-2xl bg-photo-red/5">
                <p className="font-inter text-white font-medium mb-2">Jeff Honforloco</p>
                <p className="font-inter text-gray-400 text-sm leading-relaxed">
                  Based in Providence, Rhode Island — available for sessions in {info.name} by appointment. Travel for the right project.
                </p>
                <Link
                  to="/book"
                  className="inline-flex items-center gap-2 mt-4 text-photo-red text-sm font-inter font-medium hover:text-white transition-colors"
                >
                  Start your session →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-photo-gray-900 border-t border-photo-gray-800">
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <p className="font-inter text-xs tracking-[0.4em] text-photo-red uppercase mb-4 text-center">How It Works</p>
          <h2 className="font-playfair text-4xl md:text-5xl font-extralight tracking-wide text-white mb-16 text-center leading-tight">
            Booking in {info.name}
          </h2>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { n: '01', title: 'Reach Out', body: 'Tell Jeff about your project — the vision, the goal, and your preferred dates. No long forms.' },
              { n: '02', title: 'Creative Consult', body: 'Jeff connects with you to align on concept, location, wardrobe, and direction before the shoot.' },
              { n: '03', title: 'Shoot & Deliver', body: 'Your session is executed and gallery-ready retouched images are delivered to your inbox.' },
            ].map((step) => (
              <div key={step.n} className="flex flex-col items-start">
                <span className="font-playfair text-7xl font-extralight text-photo-red/20 leading-none mb-4 select-none">{step.n}</span>
                <div className="w-8 h-px bg-photo-red mb-4" />
                <h3 className="font-playfair text-2xl font-light text-white mb-3">{step.title}</h3>
                <p className="font-inter font-light text-gray-400 text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link
              to="/book"
              className="inline-block bg-photo-red hover:bg-photo-red-hover text-white px-12 py-4 font-inter font-medium tracking-[0.2em] uppercase text-sm transition-all duration-300 hover:scale-105"
            >
              {info.cta}
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default LocationLanding;
