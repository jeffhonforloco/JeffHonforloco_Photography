import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SEO from './SEO';
import serviceAuthorityMeta from '@/data/service-authority-meta.json';
import { SERVICE_AUTHORITY_BY_PATH } from '@/data/service-authority-data';

interface RouteMeta {
  title: string;
  description: string;
  image?: string;
  noIndex?: boolean;
}

const STATIC_META: Record<string, RouteMeta> = {
  '/': {
    title: 'Jeff Honforloco Photography | Fashion, Beauty & Editorial Photographer',
    description: 'Fashion, beauty, editorial, headshot, event and commercial photography by Jeff Honforloco. Based in Providence, Rhode Island and available for travel.',
  },
  '/portfolios': {
    title: 'Photography Portfolios | Jeff Honforloco Photography',
    description: 'Explore fashion, beauty, editorial, glamour, headshot and lifestyle photography portfolios by Jeff Honforloco.',
  },
  '/services': {
    title: 'Photography Services | Jeff Honforloco Photography',
    description: 'Photography services for fashion, beauty, editorial, headshots, weddings, events, real estate and commercial projects.',
  },
  '/about': {
    title: 'About Jeff Honforloco | Photographer in Providence, RI',
    description: 'Meet photographer Jeff Honforloco and learn about his approach to fashion, beauty, editorial and commercial photography.',
  },
  '/contact': {
    title: 'Contact Jeff Honforloco Photography',
    description: 'Tell Jeff about your photography project, preferred date, location and creative goals. Responses are typically sent within 24 hours.',
  },
  '/book': {
    title: 'Book a Photography Session | Jeff Honforloco Photography',
    description: 'Choose a photography service and package, request a date and send your project details to Jeff Honforloco Photography.',
  },
  '/pricing': {
    title: 'Photography Packages & Pricing | Jeff Honforloco Photography',
    description: 'Compare photography packages for portraits, fashion, beauty, editorial, weddings, events, real estate and motion projects.',
  },
  '/journal': {
    title: 'Photography Journal | Jeff Honforloco Photography',
    description: 'Practical guidance about preparing for portrait, fashion, beauty and editorial photography sessions.',
  },
  '/motion': {
    title: 'Motion & Video Portfolio | Jeff Honforloco Photography',
    description: 'View motion, campaign and short-form video work from Jeff Honforloco Photography.',
  },
  '/prep-guide': {
    title: 'Photography Session Prep Guide | Jeff Honforloco Photography',
    description: 'Prepare wardrobe, styling and creative details for your upcoming photography session.',
  },
  '/admin': { title: 'Studio Admin', description: 'Studio administration.', noIndex: true },
  '/dashboard': { title: 'Studio Dashboard', description: 'Studio dashboard.', noIndex: true },
};

serviceAuthorityMeta.forEach(({ path, title, description, image }) => {
  STATIC_META[path] = { title, description, image };
});

const titleCase = (value: string): string =>
  value.split('-').filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');

const getRouteMeta = (pathname: string): RouteMeta => {
  if (STATIC_META[pathname]) return STATIC_META[pathname];
  if (pathname.startsWith('/admin/')) return STATIC_META['/admin'];

  if (pathname.startsWith('/portfolios/')) {
    const category = titleCase(pathname.split('/')[2] ?? 'Photography');
    return {
      title: `${category} Photography Portfolio | Jeff Honforloco Photography`,
      description: `View ${category.toLowerCase()} photography by Jeff Honforloco.`,
    };
  }

  if (pathname.startsWith('/journal/')) {
    return {
      title: `${titleCase(pathname.split('/')[2] ?? 'Photography Article')} | Jeff Honforloco Photography`,
      description: 'Photography preparation, creative direction and production guidance from Jeff Honforloco.',
    };
  }

  return {
    title: 'Page Not Found | Jeff Honforloco Photography',
    description: 'The requested page could not be found.',
    noIndex: true,
  };
};

const RouteMetadata = () => {
  const { pathname } = useLocation();
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const meta = getRouteMeta(normalizedPath);
  const servicePage = SERVICE_AUTHORITY_BY_PATH[normalizedPath];
  const additionalSchemas = servicePage ? [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `https://jeffhonforlocophotos.com${servicePage.path}#service`,
      name: servicePage.h1,
      description: servicePage.description,
      url: `https://jeffhonforlocophotos.com${servicePage.path}`,
      image: `https://jeffhonforlocophotos.com${servicePage.image}`,
      provider: { '@id': 'https://jeffhonforlocophotos.com/#business' },
      mainEntityOfPage: { '@id': `https://jeffhonforlocophotos.com${servicePage.path}#webpage` },
      areaServed: [
        { '@type': 'City', name: 'Providence' },
        { '@type': 'State', name: 'Rhode Island' },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://jeffhonforlocophotos.com/' },
        { '@type': 'ListItem', position: 2, name: 'Services', item: 'https://jeffhonforlocophotos.com/services' },
        { '@type': 'ListItem', position: 3, name: servicePage.h1, item: `https://jeffhonforlocophotos.com${servicePage.path}` },
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: servicePage.faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  ] : [];

  // Static route entry points give crawlers correct metadata before JS runs.
  // Once React is active, remove those copies so Helmet owns one canonical and
  // one description during client-side navigation.
  useEffect(() => {
    document.head.querySelectorAll('[data-static-meta="true"]').forEach((element) => element.remove());
  }, [normalizedPath]);

  return <SEO title={meta.title} description={meta.description} image={meta.image} url={normalizedPath} noIndex={meta.noIndex} type={normalizedPath.startsWith('/journal/') ? 'article' : 'website'} additionalSchemas={additionalSchemas} />;
};

export default RouteMetadata;
