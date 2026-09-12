import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  additionalSchemas?: Record<string, unknown>[];
}

const SITE_URL = 'https://jeffhonforlocophotos.com';
const SITE_NAME = 'Jeff Honforloco Photography';
const DEFAULT_IMAGE = '/images/optimized/IMG_7671-960.webp?v=20260901';
const DEFAULT_DESCRIPTION =
  'Fashion, beauty, editorial, headshot, event and commercial photography by Jeff Honforloco. Based in Providence, Rhode Island and available for travel.';

const normalizePath = (value: string): string => {
  if (value.startsWith('http')) return value;
  if (value === '' || value === '/') return `${SITE_URL}/`;
  return `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
};

const SEO = ({
  title = 'Jeff Honforloco Photography | Fashion, Beauty & Editorial Photographer',
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
  additionalSchemas = [],
}: SEOProps) => {
  const routePath = url ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
  const fullTitle = title.includes('Jeff Honforloco') ? title : `${title} | ${SITE_NAME}`;
  const fullUrl = normalizePath(routePath);
  const fullImage = normalizePath(image);

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebPage',
    '@id': `${fullUrl}#webpage`,
    name: fullTitle,
    description,
    url: fullUrl,
    image: fullImage,
    primaryImageOfPage: {
      '@type': 'ImageObject',
      contentUrl: fullImage,
      caption: fullTitle,
    },
    isPartOf: {
      '@id': `${SITE_URL}/#website`,
    },
    about: { '@id': `${SITE_URL}/#business` },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    publisher: { '@id': `${SITE_URL}/#business` },
  };

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: 'Jeff Honforloco',
    url: `${SITE_URL}/about`,
    image: `${SITE_URL}${DEFAULT_IMAGE}`,
    jobTitle: 'Photographer',
    worksFor: { '@id': `${SITE_URL}/#business` },
  };

  const businessSchema = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#business`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    image: fullImage,
    telephone: '+1-646-379-4237',
    email: 'info@jeffhonforlocophotos.com',
    priceRange: '$$$',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Providence',
      addressRegion: 'RI',
      addressCountry: 'US',
    },
    founder: { '@id': `${SITE_URL}/#person` },
    areaServed: [
      { '@type': 'City', name: 'Providence' },
      { '@type': 'State', name: 'Rhode Island' },
      { '@type': 'AdministrativeArea', name: 'New England' },
      { '@type': 'Country', name: 'United States' },
    ],
    sameAs: [
      'https://www.facebook.com/jeffhonforlocophotography',
      'https://instagram.com/jeffhonforlocophotos',
      'https://youtube.com/@jeffhonforlocophotos',
      'https://x.com/jeffhonforloco',
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Photography Services',
      itemListElement: [
        'Fashion Photography',
        'Beauty Photography',
        'Editorial Photography',
        'Headshot Photography',
        'Wedding Photography',
        'Engagement Photography',
        'Sweet 16 and Quinceañera Photography',
        'Event Photography',
        'Real Estate Photography',
        'Commercial Photography',
      ].map((name) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name },
      })),
    },
  };

  const schemas = [
    webPageSchema,
    websiteSchema,
    businessSchema,
    personSchema,
    ...additionalSchemas,
  ];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta
        name="robots"
        content={noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'}
      />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <link rel="canonical" href={fullUrl} />
      <script type="application/ld+json">{JSON.stringify(schemas)}</script>
    </Helmet>
  );
};

export default SEO;
