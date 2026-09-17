/**
 * Real service pricing, mirrored from the public site's pricing page
 * (src/data/pricing-data.ts). Keep in sync when site pricing changes.
 */
export interface PricingTier {
  name: string;
  price: string;
  starting: number;
}

export interface ServicePricing {
  id: string;
  name: string;
  tagline: string;
  starting: number;
  tiers: PricingTier[];
}

export const SERVICE_PRICING: ServicePricing[] = [
  {
    id: 'headshots', name: 'Headshots & Portraits', tagline: 'Studio or we come to you — individuals, teams & LinkedIn profiles',
    starting: 499,
    tiers: [
      { name: 'Starter', price: 'From $499', starting: 499 },
      { name: 'Professional', price: 'From $1,100', starting: 1100 },
      { name: 'Corporate Team Headshots', price: 'Starting at $3,500', starting: 3500 },
    ],
  },
  {
    id: 'beauty', name: 'Beauty Photography', tagline: 'Elegant beauty portraits for personal brands, cosmetics & editorial',
    starting: 499,
    tiers: [
      { name: 'Starter', price: 'From $499', starting: 499 },
      { name: 'Standard', price: 'From $1,400', starting: 1400 },
      { name: 'Full Editorial', price: 'From $3,200', starting: 3200 },
    ],
  },
  {
    id: 'fashion', name: 'Fashion Photography', tagline: 'For aspiring models, influencers, designers & creative brands',
    starting: 499,
    tiers: [
      { name: 'Starter', price: 'From $499', starting: 499 },
      { name: 'Standard', price: 'From $1,800', starting: 1800 },
      { name: 'Full Campaign', price: 'Custom', starting: 6500 },
    ],
  },
  {
    id: 'glamour', name: 'Glamour Photography', tagline: 'Dramatic lighting, bold styling, unforgettable portraits',
    starting: 499,
    tiers: [
      { name: 'Starter', price: 'From $499', starting: 499 },
      { name: 'Premium', price: 'From $1,400', starting: 1400 },
      { name: 'Signature', price: 'Custom', starting: 4000 },
    ],
  },
  {
    id: 'editorial', name: 'Editorial Photography', tagline: 'Magazine-quality storytelling for publications, brands & campaigns',
    starting: 499,
    tiers: [
      { name: 'Starter', price: 'From $499', starting: 499 },
      { name: 'Standard', price: 'From $2,200', starting: 2200 },
      { name: 'Full Editorial', price: 'Custom', starting: 6000 },
    ],
  },
  {
    id: 'lifestyle', name: 'Lifestyle Photography', tagline: 'Real moments, authentic stories — individuals, couples & families',
    starting: 499,
    tiers: [
      { name: 'Starter', price: 'From $499', starting: 499 },
      { name: 'Standard', price: 'From $1,100', starting: 1100 },
      { name: 'Premium', price: 'From $2,000', starting: 2000 },
    ],
  },
  {
    id: 'wedding', name: 'Wedding & Engagements', tagline: 'From intimate engagements to full-day celebrations across New England',
    starting: 850,
    tiers: [
      { name: 'Engagement Session', price: 'From $850', starting: 850 },
      { name: 'Wedding Essentials', price: 'From $3,200', starting: 3200 },
      { name: 'Full Day', price: 'From $6,500', starting: 6500 },
    ],
  },
  {
    id: 'events', name: 'Events & Celebrations', tagline: 'Sweet sixteens, galas, corporate events & milestones',
    starting: 799,
    tiers: [
      { name: 'Starter', price: 'From $799', starting: 799 },
      { name: 'Premium', price: 'From $1,800', starting: 1800 },
      { name: 'Full Coverage', price: 'Custom', starting: 4500 },
    ],
  },
  {
    id: 'real-estate', name: 'Real Estate Photography', tagline: 'Mobile shoots — we come to the property across RI, MA, ME & CT',
    starting: 499,
    tiers: [
      { name: 'Basic', price: 'From $499', starting: 499 },
      { name: 'Standard', price: 'From $999', starting: 999 },
      { name: 'Premium', price: 'From $1,800', starting: 1800 },
    ],
  },
  {
    id: 'motion', name: 'Motion Video & Cinematography', tagline: 'Cinematic content in partnership with urs79.com — New England & beyond',
    starting: 1500,
    tiers: [
      { name: 'Social Reel', price: 'From $1,500', starting: 1500 },
      { name: 'Brand Story', price: 'From $3,500', starting: 3500 },
      { name: 'Full Production', price: 'Custom', starting: 8500 },
    ],
  },
];

export const findServicePricing = (id: string): ServicePricing | undefined =>
  SERVICE_PRICING.find((s) => s.id === id.toLowerCase());
