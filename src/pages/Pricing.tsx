import { useState } from 'react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle,
  MapPin,
  Smartphone,
  ExternalLink,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Users,
  Film,
} from 'lucide-react';
import { PRICING_CATEGORIES, NE_LOCATIONS, VOLUME_HEADSHOT_RATES } from '@/data/pricing-data';
import type { PricingCategory } from '@/data/pricing-data';

const Pricing = () => {
  const [activeCategory, setActiveCategory] = useState<string>('headshots');
  const [expandedTiers, setExpandedTiers] = useState<Record<string, boolean>>({});

  const current = PRICING_CATEGORIES.find((c) => c.id === activeCategory) as PricingCategory;

  function toggleTier(tierId: string) {
    setExpandedTiers((prev) => ({ ...prev, [tierId]: !prev[tierId] }));
  }

  return (
    <Layout>
      <SEO
        title="Pricing — Jeff Honforloco Photography | Rhode Island · Massachusetts · Maine · Connecticut"
        description="Clear, honest photography pricing starting from $499. Headshots, beauty, fashion, editorial, wedding, events, real estate & motion video across New England."
        url="/pricing"
      />

      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">

        {/* ── Hero ── */}
        <section className="pt-28 pb-14 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-photo-red/10 border border-photo-red/30 rounded-full px-4 py-2 mb-6">
              <CheckCircle className="w-4 h-4 text-photo-red" />
              <span className="text-sm text-photo-red font-medium">Transparent Pricing · No Surprises</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-5 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent leading-tight">
              Photography<br />Starting at <span className="text-photo-red">$499</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Every session is priced so anyone can start. Pick a category, choose a tier, or
              chat with our AI to build a custom package — we'll find what works for your budget.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                asChild
                className="bg-photo-red hover:bg-photo-red-hover text-white px-8 py-3 text-base"
              >
                <a href="/book">Book a Session</a>
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
                Get a Custom Quote
              </Button>
            </div>
          </div>
        </section>

        {/* ── Location Coverage ── */}
        <section className="py-8 px-6 border-y border-white/10 bg-white/2">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-photo-red" />
              <h2 className="text-lg font-semibold text-white">Serving All of New England</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {NE_LOCATIONS.map((loc) => (
                <div
                  key={loc.state}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-photo-red/40 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-photo-red text-white text-xs font-bold px-2 py-0.5 rounded">
                      {loc.abbr}
                    </span>
                    <span className="text-white font-semibold text-sm">{loc.state}</span>
                  </div>
                  <p className="text-gray-400 text-xs mb-2">{loc.note}</p>
                  <p className="text-gray-500 text-xs">{loc.cities.join(' · ')}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Mobile Headshots Banner ── */}
        <section className="py-6 px-6 bg-gradient-to-r from-photo-red/10 via-photo-red/5 to-transparent border-b border-photo-red/20">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-photo-red/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Smartphone className="w-5 h-5 text-photo-red" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Corporate & Office Headshots — We Come to You</p>
                <p className="text-gray-400 text-xs mt-0.5">
                  Mobile headshot service across RI, MA, ME & CT · Teams of any size · 48-hour delivery
                </p>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              className="bg-photo-red hover:bg-photo-red-hover text-white flex-shrink-0"
            >
              <a href="/book">Book Mobile Shoot</a>
            </Button>
          </div>
        </section>

        {/* ── Category Selector + Tiers ── */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">

            {/* Tab strip */}
            <div className="flex flex-wrap gap-2 mb-10 justify-center">
              {PRICING_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-150 ${
                    activeCategory === cat.id
                      ? 'bg-photo-red text-white shadow-lg shadow-photo-red/20'
                      : 'bg-white/5 text-gray-300 border border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <span aria-hidden="true">{cat.icon}</span>
                  <span>{cat.name}</span>
                  {cat.isMobile && (
                    <Smartphone className="w-3 h-3 opacity-60" />
                  )}
                  {cat.urs79Affiliate && (
                    <Film className="w-3 h-3 opacity-60" />
                  )}
                </button>
              ))}
            </div>

            {/* Active category */}
            {current && (
              <div>
                <div className="text-center mb-10">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl">{current.icon}</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white">{current.name}</h2>
                  </div>
                  <p className="text-gray-400 text-lg">{current.tagline}</p>
                  {current.isMobile && (
                    <div className="inline-flex items-center gap-1.5 mt-3 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1">
                      <Smartphone className="w-3.5 h-3.5 text-blue-400" />
                      <span className="text-blue-400 text-xs font-medium">Mobile service available — we travel to you</span>
                    </div>
                  )}
                  {current.urs79Affiliate && (
                    <div className="inline-flex items-center gap-1.5 mt-3 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1">
                      <Film className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-purple-400 text-xs font-medium">
                        In partnership with{' '}
                        <a
                          href="https://urs79.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-purple-300"
                        >
                          urs79.com
                        </a>
                      </span>
                    </div>
                  )}
                </div>

                {/* Tiers — starter always shown, others revealed */}
                <div className="grid md:grid-cols-3 gap-6">
                  {current.tiers.map((tier, idx) => {
                    const isStarterTier = idx === 0;
                    const isExpanded = isStarterTier || expandedTiers[tier.id];
                    const hasBadge = !!tier.badge;

                    return (
                      <Card
                        key={tier.id}
                        className={`relative border transition-all duration-200 ${
                          hasBadge
                            ? 'border-photo-red bg-photo-red/5 shadow-lg shadow-photo-red/10'
                            : 'border-white/10 bg-white/5'
                        } hover:border-white/30`}
                      >
                        {hasBadge && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="bg-photo-red text-white text-xs px-3 py-0.5 shadow">
                              {tier.badge}
                            </Badge>
                          </div>
                        )}

                        <CardHeader className="pb-3 pt-6">
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-white text-xl">{tier.name}</CardTitle>
                              <p className="text-photo-red font-bold text-2xl mt-1">{tier.price}</p>
                              <p className="text-gray-500 text-xs mt-0.5">{tier.duration}{tier.images ? ` · ${tier.images}` : ''}</p>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="pt-0 space-y-4">
                          {/* Always-visible deliverables for starter, collapsible for others */}
                          <div>
                            <ul className="space-y-1.5">
                              {(isExpanded ? tier.deliverables : tier.deliverables.slice(0, 2)).map(
                                (item, i) => (
                                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                                    <CheckCircle className="w-4 h-4 text-photo-red flex-shrink-0 mt-0.5" />
                                    {item}
                                  </li>
                                ),
                              )}
                              {!isExpanded && tier.deliverables.length > 2 && (
                                <li className="text-gray-500 text-xs pl-6">
                                  +{tier.deliverables.length - 2} more included
                                </li>
                              )}
                            </ul>

                            {/* Expand toggle for non-starter tiers */}
                            {!isStarterTier && tier.deliverables.length > 2 && (
                              <button
                                onClick={() => toggleTier(tier.id)}
                                className="mt-2 flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-3 h-3" /> Show less
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-3 h-3" /> See what's included
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          {tier.note && (
                            <p className="text-xs text-gray-500 italic border-t border-white/10 pt-3">
                              {tier.note}
                              {tier.note.includes('urs79') && (
                                <a
                                  href="https://urs79.com"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-1 inline-flex items-center gap-0.5 text-purple-400 hover:text-purple-300"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </p>
                          )}

                          <Button
                            asChild
                            className={`w-full ${
                              hasBadge
                                ? 'bg-photo-red hover:bg-photo-red-hover text-white'
                                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                            }`}
                          >
                            <a href={`/book?service=${current.id}&tier=${tier.id}`}>
                              Book This Package
                            </a>
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Volume note for mobile/headshot categories */}
                {current.volumeNote && (
                  <div className="mt-8 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl flex items-start gap-3">
                    <Users className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-300 text-sm">{current.volumeNote}</p>
                  </div>
                )}

                {/* urs79 callout for motion-affiliated categories */}
                {current.urs79Affiliate && (
                  <div className="mt-8 p-5 bg-purple-500/5 border border-purple-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Film className="w-4 h-4 text-purple-400" />
                        <span className="text-white font-semibold text-sm">Powered by urs79.com</span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        All motion video packages are co-produced with{' '}
                        <a
                          href="https://urs79.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-400 hover:text-purple-300 underline"
                        >
                          urs79.com
                        </a>{' '}
                        — New England's full-service multimedia production company. Photography + video
                        bundled in one seamless workflow.
                      </p>
                    </div>
                    <a
                      href="https://urs79.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-purple-500/20 border border-purple-500/30 hover:border-purple-400 text-purple-300 hover:text-purple-200 px-4 py-2 rounded-lg text-sm transition-colors flex-shrink-0"
                    >
                      Visit urs79.com <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Volume Headshots Table ── */}
        <section className="py-16 px-6 bg-white/2 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-4">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span className="text-blue-400 text-sm font-medium">Mobile Corporate Headshots</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">We Come to Your Office</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Corporate and office headshots are a mobile service. The bigger your team, the better
                the rate. We travel across Rhode Island, Massachusetts, Maine & Connecticut.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="text-left px-6 py-4 text-gray-300 font-semibold">Team Size</th>
                    <th className="text-left px-6 py-4 text-gray-300 font-semibold">Rate per Person</th>
                    <th className="text-left px-6 py-4 text-gray-300 font-semibold hidden sm:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {VOLUME_HEADSHOT_RATES.map((row, i) => (
                    <tr
                      key={i}
                      className={`border-b border-white/5 last:border-0 ${
                        i === 0 ? 'bg-transparent' : i % 2 === 0 ? 'bg-white/2' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-white font-medium">{row.label}</td>
                      <td className="px-6 py-4 text-photo-red font-bold text-base">
                        ${row.pricePerPerson.toLocaleString()}/person
                      </td>
                      <td className="px-6 py-4 text-gray-400 hidden sm:table-cell">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 text-center">
              <Button asChild className="bg-photo-red hover:bg-photo-red-hover text-white px-8">
                <a href="/book?service=headshots">Get Your Team Booked</a>
              </Button>
            </div>
          </div>
        </section>

        {/* ── Motion Video + urs79 Feature ── */}
        <section className="py-20 px-6 border-t border-white/10">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-5">
                  <Film className="w-4 h-4 text-purple-400" />
                  <span className="text-purple-400 text-sm font-medium">Photography + Video · One Team</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Need Motion Video Too?
                </h2>
                <p className="text-gray-300 leading-relaxed mb-5">
                  Jeff Honforloco Photography is officially affiliated with{' '}
                  <a
                    href="https://urs79.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline font-medium"
                  >
                    urs79.com
                  </a>
                  {' '}— a full-service multimedia production company. When you book both photography
                  and motion video together, you get one coordinated team, one shoot day, and one
                  seamless creative vision.
                </p>
                <ul className="space-y-2 mb-7">
                  {[
                    'Social reels, brand stories & full productions',
                    'Photo + video bundled for maximum value',
                    'Same creative direction across both mediums',
                    'New England coverage — RI, MA, ME, CT',
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                      <CheckCircle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-3">
                  <Button
                    asChild
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <a href="/book?service=motion">Book Motion Package</a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-purple-200"
                  >
                    <a href="https://urs79.com" target="_blank" rel="noopener noreferrer">
                      Visit urs79.com <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Social Reel', price: 'From $499', icon: '📱' },
                  { label: 'Brand Story', price: 'From $1,500', icon: '🎥' },
                  { label: 'Photo + Video Bundle', price: 'Save 15%', icon: '📸' },
                  { label: 'Full Production', price: 'Custom', icon: '🎬' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-5 text-center hover:border-purple-400/30 transition-colors"
                  >
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <p className="text-white text-sm font-semibold mb-1">{item.label}</p>
                    <p className="text-purple-400 text-sm font-bold">{item.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── AI Negotiation CTA ── */}
        <section className="py-20 px-6 border-t border-white/10 bg-gradient-to-br from-gray-900/60 to-black/60">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 bg-photo-red/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="w-8 h-8 text-photo-red" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Budget Doesn't Quite Fit?
            </h2>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              Tell our studio AI what you have in mind and what you're working with. It'll find the
              best match — and if it needs to go custom, it routes directly to Jeff for final approval.
              No pressure, no judgment.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                className="bg-photo-red hover:bg-photo-red-hover text-white px-8 py-3 text-base"
                onClick={() => {
                  const btn = document.querySelector<HTMLButtonElement>('[aria-label="Chat with Jeff\'s studio"]');
                  btn?.click();
                }}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Discuss My Budget
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 px-8 py-3 text-base"
              >
                <a href="/book">Go Straight to Booking</a>
              </Button>
            </div>
          </div>
        </section>

      </main>
    </Layout>
  );
};

export default Pricing;
