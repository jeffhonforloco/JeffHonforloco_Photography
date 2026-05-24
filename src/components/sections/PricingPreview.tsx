import { CheckCircle, ArrowRight, MessageCircle, Smartphone, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PREVIEW_CATEGORIES = [
  {
    icon: '📸',
    name: 'Headshots & Portraits',
    teaser: 'Studio or mobile — individuals & teams',
    startingAt: '$499',
    highlight: 'Mobile to your office across New England',
    isMobile: true,
  },
  {
    icon: '💍',
    name: 'Weddings & Events',
    teaser: 'Engagements, celebrations & milestones',
    startingAt: '$499',
    highlight: 'Engagement sessions from $499',
  },
  {
    icon: '✨',
    name: 'Beauty, Fashion & Glamour',
    teaser: 'Editorial portraits & brand content',
    startingAt: '$499',
    highlight: '1-hour starter sessions available',
  },
  {
    icon: '🎬',
    name: 'Motion Video',
    teaser: 'Social reels to full brand productions',
    startingAt: '$1,500',
    highlight: 'In partnership with urs79.com',
    isMotion: true,
  },
];

const PricingPreview = () => {
  return (
    <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-950 border-t border-white/10">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-photo-red/10 border border-photo-red/30 rounded-full px-4 py-2 mb-5">
            <CheckCircle className="w-4 h-4 text-photo-red" />
            <span className="text-sm text-photo-red font-medium">Simple, Honest Pricing</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Every Session Starts at{' '}
            <span className="text-photo-red">$499</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            No hidden fees. No gatekeeping. Pick a session that works for your budget and
            build from there — or let our AI help you design something custom.
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {PREVIEW_CATEGORIES.map((cat) => (
            <a
              key={cat.name}
              href="/pricing"
              className="group block bg-white/5 border border-white/10 hover:border-photo-red/40 rounded-xl p-5 transition-all duration-200 hover:bg-white/8 hover:scale-[1.02]"
            >
              <div className="text-3xl mb-3">{cat.icon}</div>
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="text-white font-semibold text-sm leading-tight">{cat.name}</h3>
                {cat.isMobile && <Smartphone className="w-3 h-3 text-blue-400 flex-shrink-0" />}
                {cat.isMotion && <Film className="w-3 h-3 text-purple-400 flex-shrink-0" />}
              </div>
              <p className="text-gray-500 text-xs mb-3">{cat.teaser}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-gray-500 text-xs">Starting at</p>
                  <p className="text-photo-red font-bold text-xl">{cat.startingAt}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-photo-red group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-white/5">{cat.highlight}</p>
            </a>
          ))}
        </div>

        {/* CTA Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            asChild
            className="bg-photo-red hover:bg-photo-red-hover text-white px-8 py-3 text-base"
          >
            <a href="/pricing">
              See All Packages <ArrowRight className="w-4 h-4 ml-2" />
            </a>
          </Button>
          <Button
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 py-3 text-base"
            onClick={() => {
              const btn = document.querySelector<HTMLButtonElement>('[aria-label="Chat with Jeff\'s studio"]');
              btn?.click();
            }}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Build a Custom Package
          </Button>
        </div>

        {/* New England coverage note */}
        <p className="text-center text-gray-600 text-sm mt-6">
          Serving Rhode Island · Massachusetts · Maine · Connecticut
          <span className="mx-2">·</span>
          Mobile shoots available across all 4 states
        </p>

      </div>
    </section>
  );
};

export default PricingPreview;
