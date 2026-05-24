// Local Storage Service to replace Supabase database operations
// This service handles data persistence using localStorage and IndexedDB

interface Contact {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  message: string;
  service_type?: string;
  budget_range?: string;
  event_date?: string;
  status: 'new' | 'contacted' | 'qualified' | 'booked' | 'completed';
  created_at: string;
  updated_at: string;
  notes?: string;
}

interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  slug: string;
  featured_image_url?: string;
  author_id?: string;
  status: 'draft' | 'published';
  published_at?: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

interface PortfolioImage {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  thumbnail_url?: string;
  category: string;
  is_featured: boolean;
  sort_order?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  metadata?: Record<string, unknown>;
}

class LocalStorageService {
  private readonly CONTACTS_KEY = 'photography_contacts';
  private readonly BLOG_POSTS_KEY = 'photography_blog_posts';
  private readonly PORTFOLIO_KEY = 'photography_portfolio';

  // Contact Management
  async saveContact(contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>): Promise<Contact> {
    const contacts = await this.getContacts();
    const newContact: Contact = {
      ...contact,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    contacts.push(newContact);
    localStorage.setItem(this.CONTACTS_KEY, JSON.stringify(contacts));
    return newContact;
  }

  async getContacts(): Promise<Contact[]> {
    const data = localStorage.getItem(this.CONTACTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  async updateContact(id: string, updates: Partial<Contact>): Promise<Contact | null> {
    const contacts = await this.getContacts();
    const index = contacts.findIndex(c => c.id === id);
    
    if (index === -1) return null;
    
    contacts[index] = {
      ...contacts[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    localStorage.setItem(this.CONTACTS_KEY, JSON.stringify(contacts));
    return contacts[index];
  }

  async deleteContact(id: string): Promise<boolean> {
    const contacts = await this.getContacts();
    const filtered = contacts.filter(c => c.id !== id);
    localStorage.setItem(this.CONTACTS_KEY, JSON.stringify(filtered));
    return true;
  }

  // Blog Post Management
  async saveBlogPost(post: Omit<BlogPost, 'id' | 'created_at' | 'updated_at'>): Promise<BlogPost> {
    const posts = await this.getBlogPosts();
    const newPost: BlogPost = {
      ...post,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    posts.push(newPost);
    localStorage.setItem(this.BLOG_POSTS_KEY, JSON.stringify(posts));
    return newPost;
  }

  async getBlogPosts(): Promise<BlogPost[]> {
    const data = localStorage.getItem(this.BLOG_POSTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  async getPublishedBlogPosts(): Promise<BlogPost[]> {
    const posts = await this.getBlogPosts();
    return posts.filter(post => post.status === 'published');
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    const posts = await this.getBlogPosts();
    return posts.find(post => post.slug === slug) || null;
  }

  // Portfolio Management
  async savePortfolioImage(image: Omit<PortfolioImage, 'id' | 'created_at' | 'updated_at'>): Promise<PortfolioImage> {
    const images = await this.getPortfolioImages();
    const newImage: PortfolioImage = {
      ...image,
      id: this.generateId(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    images.push(newImage);
    localStorage.setItem(this.PORTFOLIO_KEY, JSON.stringify(images));
    return newImage;
  }

  async getPortfolioImages(): Promise<PortfolioImage[]> {
    const data = localStorage.getItem(this.PORTFOLIO_KEY);
    return data ? JSON.parse(data) : [];
  }

  async getPortfolioImagesByCategory(category: string): Promise<PortfolioImage[]> {
    const images = await this.getPortfolioImages();
    return images.filter(image => image.category === category);
  }

  async getFeaturedPortfolioImages(): Promise<PortfolioImage[]> {
    const images = await this.getPortfolioImages();
    return images.filter(image => image.is_featured);
  }

  // Utility methods
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Data export/import
  async exportData(): Promise<{ contacts: Contact[]; blogPosts: BlogPost[]; portfolio: PortfolioImage[] }> {
    return {
      contacts: await this.getContacts(),
      blogPosts: await this.getBlogPosts(),
      portfolio: await this.getPortfolioImages()
    };
  }

  async importData(data: { contacts?: Contact[]; blogPosts?: BlogPost[]; portfolio?: PortfolioImage[] }): Promise<void> {
    if (data.contacts) {
      localStorage.setItem(this.CONTACTS_KEY, JSON.stringify(data.contacts));
    }
    if (data.blogPosts) {
      localStorage.setItem(this.BLOG_POSTS_KEY, JSON.stringify(data.blogPosts));
    }
    if (data.portfolio) {
      localStorage.setItem(this.PORTFOLIO_KEY, JSON.stringify(data.portfolio));
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    localStorage.removeItem(this.CONTACTS_KEY);
    localStorage.removeItem(this.BLOG_POSTS_KEY);
    localStorage.removeItem(this.PORTFOLIO_KEY);
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();

// Export types
export type { Contact, BlogPost, PortfolioImage };
