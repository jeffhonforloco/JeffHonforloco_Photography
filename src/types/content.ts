// Content data types for the photography website

export interface ContentData {
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
  date: string;
  readTime: string;
  slug: string;
}

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
}