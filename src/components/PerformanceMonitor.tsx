import { useEffect } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

export const PerformanceMonitor = () => {
  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      return;
    }

    const measurePerformance = () => {
      const metrics: PerformanceMetrics = {
        loadTime: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0
      };

      // Measure page load time
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        metrics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      }

      // Measure Core Web Vitals
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint') {
            if (entry.name === 'first-contentful-paint') {
              metrics.firstContentfulPaint = entry.startTime;
            }
          } else if (entry.entryType === 'largest-contentful-paint') {
            metrics.largestContentfulPaint = entry.startTime;
          } else if (entry.entryType === 'layout-shift') {
            metrics.cumulativeLayoutShift += (entry as PerformanceEntry & { value: number }).value;
          } else if (entry.entryType === 'first-input') {
            metrics.firstInputDelay = (entry as PerformanceEntry & { processingStart: number }).processingStart - entry.startTime;
          }
        }

        // Store metrics for analytics
        if (import.meta.env.DEV) {
          console.log('Performance Metrics:', metrics);
        }

        // Send to analytics service
        if (typeof window !== 'undefined' && (window as { gtag?: (...args: unknown[]) => void }).gtag) {
          window.gtag('event', 'performance_metrics', {
            load_time: metrics.loadTime,
            fcp: metrics.firstContentfulPaint,
            lcp: metrics.largestContentfulPaint,
            cls: metrics.cumulativeLayoutShift,
            fid: metrics.firstInputDelay
          });
        }
      });

      // Observe different performance entry types
      try {
        observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift', 'first-input'] });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.warn('Performance monitoring not fully supported:', error);
        }
      }

      // Cleanup observer after 10 seconds
      setTimeout(() => {
        observer.disconnect();
      }, 10000);
    };

    // Start monitoring after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
    }

    return () => {
      window.removeEventListener('load', measurePerformance);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PerformanceMonitor;
