import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface AnalyticsConfig {
  googleAnalytics: {
    trackingId: string;
    enabled: boolean;
  };
  facebookPixel: {
    pixelId: string;
    enabled: boolean;
  };
  events: {
    portfolioView: string;
    contactForm: string;
    blogPost: string;
  };
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
    dataLayer?: unknown[];
  }
}

// Enhanced analytics tracking
export const trackEvent = (eventName: string, parameters: Record<string, unknown> = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent,
      page_location: window.location.href,
      page_title: document.title
    });
  }

  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }

  if (import.meta.env.DEV) {
    console.log('Analytics Event:', eventName, parameters);
  }
};

// Specific tracking functions
export const trackPortfolioView = (category: string) => {
  trackEvent('portfolio_category_view', {
    category,
    content_type: 'portfolio',
    engagement_time_msec: Date.now()
  });
};

export const trackContactForm = (formData: Record<string, unknown>) => {
  trackEvent('contact_form_submit', {
    form_type: 'contact',
    location: (formData.location as string) || 'not_specified',
    service_type: (formData.service as string) || 'not_specified',
    budget_range: (formData.budget as string) || 'not_specified'
  });
};

export const trackBlogPost = (slug: string, title: string) => {
  trackEvent('blog_post_view', {
    content_type: 'blog_post',
    content_id: slug,
    content_title: title,
    engagement_time_msec: Date.now()
  });
};

export const trackLocationLanding = (location: string) => {
  trackEvent('location_landing_view', {
    location_name: location,
    content_type: 'location_page',
    traffic_source: document.referrer || 'direct'
  });
};

export const trackBookingIntent = (source: string, location?: string) => {
  trackEvent('booking_intent', {
    source,
    location: location || 'not_specified',
    intent_level: 'high',
    timestamp: new Date().toISOString()
  });
};

// Analytics component for route tracking
const Analytics = () => {
  const location = useLocation();
  const trackingIdRef = useRef<string>('');

  useEffect(() => {
    fetch('/data/analytics-config.json')
      .then(response => response.json())
      .then((config: AnalyticsConfig) => {
        if (config.googleAnalytics.enabled && config.googleAnalytics.trackingId !== 'GA_MEASUREMENT_ID') {
          trackingIdRef.current = config.googleAnalytics.trackingId;

          const script = document.createElement('script');
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtag/js?id=${config.googleAnalytics.trackingId}`;
          document.head.appendChild(script);

          window.dataLayer = window.dataLayer || [];
          function gtag(...args: unknown[]) {
            window.dataLayer!.push(args);
          }
          window.gtag = gtag;

          gtag('js', new Date());
          gtag('config', config.googleAnalytics.trackingId, {
            page_title: document.title,
            page_location: window.location.href,
            anonymize_ip: true,
            send_page_view: true
          });
        }

        if (config.facebookPixel.enabled && config.facebookPixel.pixelId !== 'FB_PIXEL_ID') {
          const fbqFn = (...args: unknown[]) => {
            const fb = window.fbq as ((...a: unknown[]) => void) & {
              callMethod?: (...a: unknown[]) => void;
              queue?: unknown[];
              push?: (...a: unknown[]) => void;
              loaded?: boolean;
              version?: string;
            };
            if (fb?.callMethod) {
              fb.callMethod(...args);
            } else {
              (fb.queue = fb.queue || []).push(args);
            }
          };
          window.fbq = fbqFn;
          if (!window._fbq) window._fbq = fbqFn;

          const script = document.createElement('script');
          script.async = true;
          script.src = 'https://connect.facebook.net/en_US/fbevents.js';
          document.head.appendChild(script);

          window.fbq('init', config.facebookPixel.pixelId);
          window.fbq('track', 'PageView');
        }
      })
      .catch(error => console.error('Failed to load analytics config:', error));
  }, []);

  // Track route changes
  useEffect(() => {
    const currentPath = location.pathname;

    if (window.gtag && trackingIdRef.current) {
      window.gtag('config', trackingIdRef.current, {
        page_path: currentPath,
        page_title: document.title,
        page_location: window.location.href
      });
    }

    if (currentPath.startsWith('/portfolios/')) {
      const category = currentPath.split('/')[2];
      trackPortfolioView(category);
    } else if (currentPath.startsWith('/journal/')) {
      const slug = currentPath.split('/')[2];
      trackBlogPost(slug, document.title);
    } else if (currentPath.startsWith('/location/')) {
      const locationName = currentPath.split('/')[2];
      trackLocationLanding(locationName);
    }
  }, [location]);

  return null;
};

export default Analytics;
