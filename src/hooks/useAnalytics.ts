import { useState, useEffect } from 'react';

interface AnalyticsEvent {
  id: string;
  event: string;
  properties: Record<string, any>;
  timestamp: string;
  page: string;
  userAgent: string;
  referrer: string;
}

interface PageView {
  page: string;
  timestamp: string;
  referrer: string;
  userAgent: string;
}

interface AnalyticsData {
  events: AnalyticsEvent[];
  pageViews: PageView[];
  uniqueVisitors: number;
  totalPageViews: number;
  bounceRate: number;
  averageSessionDuration: number;
}

export const useAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    events: [],
    pageViews: [],
    uniqueVisitors: 0,
    totalPageViews: 0,
    bounceRate: 0,
    averageSessionDuration: 0
  });

  useEffect(() => {
    loadAnalyticsData();
    calculateMetrics();
  }, []);

  const loadAnalyticsData = () => {
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
      const pageViews = JSON.parse(localStorage.getItem('analytics_pageviews') || '[]');
      
      setAnalyticsData(prev => ({
        ...prev,
        events,
        pageViews
      }));
    } catch (error) {
      console.error('Error loading analytics data:', error);
    }
  };

  const calculateMetrics = () => {
    const pageViews = JSON.parse(localStorage.getItem('analytics_pageviews') || '[]');
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    
    // Calculate unique visitors (simplified - in production use proper session tracking)
    const uniqueVisitors = new Set(
      pageViews.map((pv: PageView) => pv.userAgent + pv.referrer)
    ).size;
    
    const totalPageViews = pageViews.length;
    
    // Simple bounce rate calculation (visitors with only 1 page view)
    const visitorSessions = pageViews.reduce((acc: Record<string, number>, pv: PageView) => {
      const key = pv.userAgent + pv.referrer;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    
    const bouncedSessions = Object.values(visitorSessions).filter(count => count === 1).length;
    const bounceRate = uniqueVisitors > 0 ? Math.round((bouncedSessions / uniqueVisitors) * 100) : 0;
    
    // Average session duration (mock calculation)
    const averageSessionDuration = Math.floor(Math.random() * 300) + 120; // 2-7 minutes
    
    setAnalyticsData(prev => ({
      ...prev,
      uniqueVisitors,
      totalPageViews,
      bounceRate,
      averageSessionDuration
    }));
  };

  const trackEvent = (event: string, properties: Record<string, any> = {}) => {
    const newEvent: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random()}`,
      event,
      properties,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      userAgent: navigator.userAgent,
      referrer: document.referrer
    };

    const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]');
    const updatedEvents = [newEvent, ...existingEvents].slice(0, 1000); // Keep last 1000 events
    
    localStorage.setItem('analytics_events', JSON.stringify(updatedEvents));
    
    setAnalyticsData(prev => ({
      ...prev,
      events: updatedEvents
    }));
  };

  const trackPageView = (page?: string) => {
    const pageView: PageView = {
      page: page || window.location.pathname,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
      userAgent: navigator.userAgent
    };

    const existingPageViews = JSON.parse(localStorage.getItem('analytics_pageviews') || '[]');
    const updatedPageViews = [pageView, ...existingPageViews].slice(0, 1000); // Keep last 1000 page views
    
    localStorage.setItem('analytics_pageviews', JSON.stringify(updatedPageViews));
    
    setAnalyticsData(prev => ({
      ...prev,
      pageViews: updatedPageViews,
      totalPageViews: updatedPageViews.length
    }));

    calculateMetrics();
  };

  const trackEmailSignup = (email: string, source: string) => {
    trackEvent('email_signup', {
      email,
      source,
      page: window.location.pathname
    });
  };

  const trackPortfolioView = (category: string, imageId?: string) => {
    trackEvent('portfolio_view', {
      category,
      imageId,
      page: window.location.pathname
    });
  };

  const trackContactFormSubmit = (formData: Record<string, any>) => {
    trackEvent('contact_form_submit', {
      ...formData,
      page: window.location.pathname
    });
  };

  const trackDownload = (filename: string, type: string) => {
    trackEvent('download', {
      filename,
      type,
      page: window.location.pathname
    });
  };

  const trackSocialClick = (platform: string, url: string) => {
    trackEvent('social_click', {
      platform,
      url,
      page: window.location.pathname
    });
  };

  const getEventsByType = (eventType: string) => {
    return analyticsData.events.filter(event => event.event === eventType);
  };

  const getPopularPages = () => {
    const pageCounts = analyticsData.pageViews.reduce((acc: Record<string, number>, pv) => {
      acc[pv.page] = (acc[pv.page] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(pageCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([page, views]) => ({ page, views }));
  };

  const getTopReferrers = () => {
    const referrerCounts = analyticsData.pageViews
      .filter(pv => pv.referrer && !pv.referrer.includes(window.location.hostname))
      .reduce((acc: Record<string, number>, pv) => {
        try {
          const domain = new URL(pv.referrer).hostname;
          acc[domain] = (acc[domain] || 0) + 1;
        } catch {
          acc['Direct'] = (acc['Direct'] || 0) + 1;
        }
        return acc;
      }, {});

    return Object.entries(referrerCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([referrer, visits]) => ({ referrer, visits }));
  };

  const getAnalyticsByDateRange = (startDate: Date, endDate: Date) => {
    const filteredEvents = analyticsData.events.filter(event => {
      const eventDate = new Date(event.timestamp);
      return eventDate >= startDate && eventDate <= endDate;
    });

    const filteredPageViews = analyticsData.pageViews.filter(pv => {
      const pvDate = new Date(pv.timestamp);
      return pvDate >= startDate && pvDate <= endDate;
    });

    return {
      events: filteredEvents,
      pageViews: filteredPageViews,
      totalEvents: filteredEvents.length,
      totalPageViews: filteredPageViews.length
    };
  };

  const exportAnalytics = () => {
    const data = {
      events: analyticsData.events,
      pageViews: analyticsData.pageViews,
      summary: {
        uniqueVisitors: analyticsData.uniqueVisitors,
        totalPageViews: analyticsData.totalPageViews,
        bounceRate: analyticsData.bounceRate,
        averageSessionDuration: analyticsData.averageSessionDuration
      },
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return {
    analyticsData,
    trackEvent,
    trackPageView,
    trackEmailSignup,
    trackPortfolioView,
    trackContactFormSubmit,
    trackDownload,
    trackSocialClick,
    getEventsByType,
    getPopularPages,
    getTopReferrers,
    getAnalyticsByDateRange,
    exportAnalytics
  };
};