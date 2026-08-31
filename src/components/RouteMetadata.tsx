import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import SEO from './SEO';

interface RouteMeta {
  title: string;
  description: string;
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

  if (pathname.startsWith('/location/') || /^\/(nyc|los-angeles|miami|paris|london|italy|lagos|switzerland|malta|monaco|rhode-island|massachusetts|maine|connecticut)$/.test(pathname)) {
    const location = titleCase(pathname.split('/').filter(Boolean).pop() ?? 'United States');
    return {
      title: `Photographer Available in ${location} | Jeff Honforloco Photography`,
      description: `Book fashion, beauty, portrait, event and commercial photography in ${location}, subject to project availability and travel.`,
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
  const meta = getRouteMeta(pathname);

  // Static route entry points give crawlers correct metadata before JS runs.
  // Once React is active, remove those copies so Helmet owns one canonical and
  // one description during client-side navigation.
  useLayoutEffect(() => {
    document.head.querySelectorAll('[data-static-meta="true"]').forEach((element) => element.remove());
  }, [pathname]);

  return <SEO title={meta.title} description={meta.description} url={pathname} noIndex={meta.noIndex} type={pathname.startsWith('/journal/') ? 'article' : 'website'} />;
};

export default RouteMetadata;
