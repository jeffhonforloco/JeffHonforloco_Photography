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

class ApiService {
  private baseUrl: string;

  constructor() {
    // Use environment variable for backend API
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';
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
