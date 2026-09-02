import { defineTool } from '@nekuda/webmcp-sdk';
import { PRICING_CATEGORIES } from '@/data/pricing-data';
import { BOOKING_DRAFT_STORAGE_KEY } from '../constants';

const PORTFOLIO_CATEGORIES = [
  'beauty',
  'fashion',
  'editorial',
  'glamour',
  'headshots',
  'lifestyle',
  'motion',
] as const;

const SITE_SECTIONS = [
  {
    title: 'Booking process',
    path: '/book',
    content:
      'Choose a photography service and package, request a date and time, then provide project and contact details. Every request is personally reviewed and normally receives a response within 24 hours.',
  },
  {
    title: 'Service area',
    path: '/services',
    content:
      'Jeff Honforloco Photography is based in Providence, Rhode Island, serves New England and clients nationwide, and travels for the right project.',
  },
  {
    title: 'Portfolio',
    path: '/portfolios',
    content:
      'Published portfolio categories include beauty, fashion, editorial, glamour, headshots, lifestyle, and motion work.',
  },
  {
    title: 'Contact',
    path: '/contact',
    content:
      'Visitors can send a project inquiry through the contact page or call +1 646-379-4237. The studio lists a 24-hour response time for inquiries.',
  },
  ...PRICING_CATEGORIES.map((category) => ({
    title: category.name,
    path: `/pricing?service=${category.id}`,
    content: [
      category.tagline,
      ...category.tiers.map(
        (tier) =>
          `${tier.name}: ${tier.price}${tier.duration ? `, ${tier.duration}` : ''}${tier.images ? `, ${tier.images}` : ''}. ${tier.deliverables.join('; ')}`,
      ),
    ].join(' '),
  })),
];

const navigateInApp = (path: string) => {
  if (typeof window === 'undefined') throw new Error('This tool requires a browser page.');
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
};

const tokenize = (value: string) =>
  value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1);

type AskSiteInput = {
  query: string;
};

export const askSite = defineTool<AskSiteInput>({
  stableKey: 'site.ask',
  name: 'ask_site',
  title: 'Ask this photography site',
  description:
    'Find relevant published information about Jeff Honforloco Photography services, packages, portfolio, service area, booking process, or contact details. Use this for factual visitor questions; it returns matching excerpts and source paths without changing the page.',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', minLength: 2, description: 'Visitor question or search phrase.' },
    },
    required: ['query'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, untrustedContentHint: false },
  source: 'merchant_authored',
  intent: 'answer',
  execute({ query }) {
    const terms = tokenize(query);
    const matches = SITE_SECTIONS.map((section) => {
      const searchable = `${section.title} ${section.content}`.toLowerCase();
      const score = terms.reduce((total, term) => total + (searchable.includes(term) ? 1 : 0), 0);
      return { ...section, score };
    })
      .filter((section) => section.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(({ score: _score, ...section }) => section);

    return {
      matches,
      note:
        matches.length > 0
          ? 'These excerpts come from the site’s published content.'
          : 'The site has no published section matching that question. Try a service, package, portfolio category, location, booking, or contact term.',
    };
  },
});

type FindServiceInput = {
  need: string;
  budgetMax?: number;
  location?: string;
};

export const findService = defineTool<FindServiceInput>({
  stableKey: 'services.find',
  name: 'find_service',
  title: 'Find a photography service',
  description:
    'Match a visitor’s photography need, optional maximum budget, and location to published service and package options. Use this when choosing what to book; it returns up to three matches and visibly opens the pricing page for the best match.',
  inputSchema: {
    type: 'object',
    properties: {
      need: { type: 'string', minLength: 2, description: 'The shoot or business outcome the visitor needs.' },
      budgetMax: { type: 'number', minimum: 0, description: 'Optional maximum budget in US dollars.' },
      location: { type: 'string', description: 'Optional city, state, or travel location.' },
    },
    required: ['need'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, untrustedContentHint: false },
  source: 'merchant_authored',
  intent: 'answer',
  execute({ need, budgetMax, location }) {
    const terms = tokenize(need);
    const ranked = PRICING_CATEGORIES.map((category) => {
      const searchable = [
        category.id,
        category.name,
        category.tagline,
        ...category.tiers.flatMap((tier) => [tier.name, tier.description ?? '', ...tier.deliverables]),
      ]
        .join(' ')
        .toLowerCase();
      const relevance = terms.reduce((total, term) => total + (searchable.includes(term) ? 2 : 0), 0);
      const affordableTiers = category.tiers.filter(
        (tier) => budgetMax === undefined || tier.priceNumeric <= budgetMax,
      );
      return { category, relevance, affordableTiers };
    })
      .filter(({ relevance, affordableTiers }) => relevance > 0 && affordableTiers.length > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 3);

    if (ranked.length === 0) {
      return {
        matches: [],
        note: 'The site has no published package matching those terms and budget. Remove the budget limit or describe the photography need more broadly.',
      };
    }

    const best = ranked[0].category;
    navigateInApp(`/pricing?service=${encodeURIComponent(best.id)}`);

    return {
      matches: ranked.map(({ category, affordableTiers }) => ({
        id: category.id,
        name: category.name,
        tagline: category.tagline,
        packages: affordableTiers.map((tier) => ({
          id: tier.id,
          name: tier.name,
          price: tier.price,
          duration: tier.duration ?? null,
        })),
      })),
      locationNote: location
        ? `The studio is based in Providence and publishes nationwide travel availability; confirm ${location} in the booking request.`
        : 'The studio is based in Providence and publishes nationwide travel availability.',
      page: `/pricing?service=${best.id}`,
    };
  },
});

type ExplorePortfolioInput = {
  category: string;
};

export const explorePortfolio = defineTool<ExplorePortfolioInput>({
  stableKey: 'portfolio.explore',
  name: 'explore_portfolio',
  title: 'Explore a portfolio',
  description:
    'Open one published Jeff Honforloco portfolio category: beauty, fashion, editorial, glamour, headshots, lifestyle, or motion. Use this when a visitor wants examples of a specific kind of work; it returns the selected category and visibly navigates to its gallery.',
  inputSchema: {
    type: 'object',
    properties: {
      category: { type: 'string', minLength: 2, description: 'Portfolio category to view.' },
    },
    required: ['category'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true, untrustedContentHint: false },
  source: 'merchant_authored',
  intent: 'act',
  execute({ category }) {
    const normalized = category.toLowerCase().trim();
    const match = PORTFOLIO_CATEGORIES.find(
      (candidate) => candidate === normalized || candidate.includes(normalized) || normalized.includes(candidate),
    );

    if (!match) {
      return {
        category: null,
        availableCategories: [...PORTFOLIO_CATEGORIES],
        note: 'The site has no published portfolio category matching that request.',
      };
    }

    const path = match === 'motion' ? '/motion' : `/portfolios/${match}`;
    navigateInApp(path);
    return { category: match, page: path, status: 'opened' };
  },
});

type PrepareBookingInput = {
  service: string;
  package?: string;
  desiredDate?: string;
  desiredTime?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  budget?: string;
  location?: string;
  locationType?: 'studio' | 'on-location' | 'both';
  projectDetails?: string;
};

export const prepareBooking = defineTool<PrepareBookingInput>({
  stableKey: 'booking.prepare',
  name: 'prepare_booking',
  title: 'Prepare a booking request',
  description:
    'Prepare and visibly open the site’s existing booking workflow with validated service, package, schedule, location, and contact details. Use this only to create a reversible draft for visitor review; it never submits an inquiry, sends email, reserves a date, or charges the visitor.',
  inputSchema: {
    type: 'object',
    properties: {
      service: { type: 'string', description: 'Published service id such as fashion, beauty, headshots, or motion.' },
      package: { type: 'string', description: 'Optional package id from the selected service.' },
      desiredDate: { type: 'string', format: 'date', description: 'Optional requested date in YYYY-MM-DD format.' },
      desiredTime: { type: 'string', description: 'Optional requested time, such as 2:00 PM.' },
      fullName: { type: 'string', description: 'Optional visitor name to place in the draft.' },
      email: { type: 'string', format: 'email', description: 'Optional visitor email to place in the draft.' },
      phone: { type: 'string', description: 'Optional visitor phone number.' },
      budget: { type: 'string', description: 'Optional budget range.' },
      location: { type: 'string', description: 'Optional shoot city or location.' },
      locationType: { type: 'string', enum: ['studio', 'on-location', 'both'], description: 'Preferred location setup.' },
      projectDetails: { type: 'string', description: 'Optional project vision and goals.' },
    },
    required: ['service'],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: false, untrustedContentHint: false },
  source: 'merchant_authored',
  intent: 'act',
  execute(input) {
    if (typeof window === 'undefined') throw new Error('This tool requires a browser page.');

    const category = PRICING_CATEGORIES.find((item) => item.id === input.service);
    if (!category) {
      throw new Error(`Unknown service "${input.service}". Use find_service to select a published service first.`);
    }
    if (input.package && !category.tiers.some((tier) => tier.id === input.package)) {
      throw new Error(`Package "${input.package}" does not belong to ${category.name}.`);
    }
    if (input.desiredDate) {
      const requestedDate = new Date(`${input.desiredDate}T12:00:00`);
      if (Number.isNaN(requestedDate.getTime())) throw new Error('desiredDate must be a valid YYYY-MM-DD date.');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (requestedDate < today) throw new Error('desiredDate cannot be in the past.');
    }

    window.sessionStorage.setItem(BOOKING_DRAFT_STORAGE_KEY, JSON.stringify(input));
    navigateInApp('/book?draft=prepared');

    return {
      status: 'draft_prepared',
      service: category.name,
      package: input.package ?? null,
      filledFields: Object.entries(input)
        .filter(([, value]) => value !== undefined && value !== '')
        .map(([field]) => field),
      page: '/book?draft=prepared',
      requiresHumanSubmission: true,
      note: 'The visitor must review the visible booking workflow and use its submit button to send the inquiry.',
    };
  },
});

export const siteTools = [askSite, findService, explorePortfolio, prepareBooking] as const;
