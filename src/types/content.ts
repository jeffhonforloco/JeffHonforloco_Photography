// Content data types for the photography website

export interface ContentData {
  personal: {
    name: string;
    profession: string;
    location: string;
    specialization: string;
    quote: string;
    bio: string;
    philosophy: string;
  };
  contact: {
    address: string;
    phone: string;
    emails: string[];
  };
  services: string[];
  experience: {
    publishedWorks: string;
    years: string;
    happyClients: string;
  };
}

export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  status: 'new' | 'replied' | 'archived';
}

export type ContactFilter = 'all' | 'new' | 'replied' | 'archived';

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  galleryImages: string[];
  date: string;
  readTime: string;
  slug: string;
}

// Parse the worker's gallery_images JSON column into a clean string array.
export const parseGalleryImages = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === 'string' && x.length > 0);
  if (typeof v !== 'string' || !v.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(v);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === 'string' && x.length > 0)
      : [];
  } catch {
    return [];
  }
};

export interface BlogData {
  posts: BlogPost[];
  categories: string[];
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description?: string;
}

export interface MotionItem {
  src: string;
  alt: string;
  caption: string;
  isVideo: boolean;
  featured?: boolean;
  isYouTube?: boolean;
  youTubeId?: string;
  isBehindLens?: boolean;
}