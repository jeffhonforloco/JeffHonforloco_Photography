// API Service to connect with custom backend
// This service handles all API communication with the backend

interface ContactEmailRequest {
  type?: string;
  full_name: string;
  email: string;
  phone?: string;
  message: string;
  service_type?: string;
  budget_range?: string;
  event_date?: string;
  location?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: unknown;
}

const API_PREFIX = '/api/v1';

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, '');
const stripLeadingSlash = (value: string) => value.replace(/^\/+/, '');

export const getApiBaseUrl = () => {
  const configuredBase = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const fallbackBase = import.meta.env.DEV ? 'http://localhost:3001/api/v1' : API_PREFIX;
  const base = stripTrailingSlash(configuredBase || fallbackBase);

  return base.endsWith(API_PREFIX) ? base : `${base}${API_PREFIX}`;
};

export const apiUrl = (path: string) => {
  const base = getApiBaseUrl();
  const normalizedPath = stripLeadingSlash(path).replace(/^api\/v1\/?/, '');
  return `${base}/${normalizedPath}`;
};

export const installApiFetchBridge = () => {
  if (typeof window === 'undefined') return;

  const windowWithBridge = window as Window & { __jeffApiFetchBridgeInstalled?: boolean };
  if (windowWithBridge.__jeffApiFetchBridgeInstalled) return;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    if (typeof input === 'string' && input.startsWith(API_PREFIX)) {
      return nativeFetch(apiUrl(input), init);
    }

    if (input instanceof Request && input.url.startsWith(`${window.location.origin}${API_PREFIX}`)) {
      return nativeFetch(new Request(apiUrl(input.url.slice(window.location.origin.length)), input), init);
    }

    return nativeFetch(input, init);
  };

  windowWithBridge.__jeffApiFetchBridgeInstalled = true;
};

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiBaseUrl();
  }

  // Send contact form email
  async sendContactEmail(data: ContactEmailRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/email/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error sending contact email:', error);
      return {
        success: false,
        error: 'Failed to send contact email'
      };
    }
  }

  // Send newsletter signup email
  async sendNewsletterSignup(email: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/email/newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error sending newsletter signup:', error);
      return {
        success: false,
        error: 'Failed to process newsletter signup'
      };
    }
  }

  // Send booking inquiry email
  async sendBookingInquiry(data: Omit<ContactEmailRequest, 'type'>): Promise<ApiResponse> {
    return this.sendContactEmail({
      type: 'booking',
      ...data
    });
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types for use in components
export type { ContactEmailRequest, ApiResponse };
