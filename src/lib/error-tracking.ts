/**
 * Error Tracking Utility
 *
 * Foundation for error tracking that can be easily extended with
 * services like Sentry, LogRocket, or custom analytics.
 *
 * Usage:
 *   import { errorTracker } from '@/lib/error-tracking';
 *
 *   // Log errors
 *   errorTracker.captureError(error, { context: 'ContactForm' });
 *
 *   // Log events
 *   errorTracker.logEvent('form_submitted', { formName: 'contact' });
 *
 *   // Set user context
 *   errorTracker.setUser({ email: 'user@example.com' });
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface ErrorContext {
  [key: string]: unknown;
  component?: string;
  action?: string;
  userId?: string;
}

interface User {
  id?: string;
  email?: string;
  name?: string;
}

class ErrorTracker {
  private isProduction: boolean;
  private user: User | null = null;
  private breadcrumbs: Array<{ timestamp: number; message: string; level: LogLevel }> = [];
  private maxBreadcrumbs = 50;

  constructor() {
    this.isProduction = import.meta.env.PROD;
  }

  /**
   * Initialize error tracking service (Sentry, LogRocket, etc.)
   * Call this in main.tsx after the service is configured
   */
  initialize(config?: { dsn?: string; environment?: string }) {
    // TODO: Initialize Sentry/LogRocket here
    // Example:
    // if (config?.dsn) {
    //   Sentry.init({
    //     dsn: config.dsn,
    //     environment: config.environment || 'production',
    //     integrations: [new BrowserTracing()],
    //     tracesSampleRate: 1.0,
    //   });
    // }

    if (!this.isProduction) {
      console.log('[ErrorTracker] Initialized in development mode');
    }

    return this;
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: User | null) {
    this.user = user;

    // TODO: Set user in Sentry/LogRocket
    // Sentry.setUser(user);
    // LogRocket.identify(user?.id || '', { ...user });

    this.logEvent('user_set', { userId: user?.id });
  }

  /**
   * Capture and report an error
   */
  captureError(error: Error | unknown, context?: ErrorContext) {
    const errorInfo = this.formatError(error);
    const fullContext = {
      ...context,
      user: this.user,
      breadcrumbs: this.breadcrumbs.slice(-10), // Last 10 breadcrumbs
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    // Add breadcrumb
    this.addBreadcrumb(`Error: ${errorInfo.message}`, 'error');

    // TODO: Send to Sentry/LogRocket
    // Sentry.captureException(error, { contexts: { custom: fullContext } });

    // Development logging
    if (!this.isProduction) {
      console.group(`🚨 Error Captured: ${errorInfo.message}`);
      console.error('Error:', error);
      console.log('Context:', fullContext);
      console.groupEnd();
    }

    // Production logging (minimal)
    if (this.isProduction) {
      console.error('[ErrorTracker]', errorInfo.message, fullContext.component || '');
    }

    return errorInfo;
  }

  /**
   * Log custom events for analytics
   */
  logEvent(eventName: string, properties?: Record<string, unknown>) {
    const eventData = {
      event: eventName,
      properties,
      user: this.user,
      timestamp: new Date().toISOString(),
    };

    // Add breadcrumb
    this.addBreadcrumb(`Event: ${eventName}`, 'info');

    // TODO: Send to analytics service
    // LogRocket.track(eventName, properties);
    // Analytics service here

    // Development logging
    if (!this.isProduction) {
      console.log(`📊 Event: ${eventName}`, properties);
    }

    return eventData;
  }

  /**
   * Log messages at different levels
   */
  log(message: string, level: LogLevel = 'info', context?: ErrorContext) {
    this.addBreadcrumb(message, level);

    const logData = {
      message,
      level,
      context,
      timestamp: new Date().toISOString(),
    };

    // TODO: Send to logging service
    // Sentry.addBreadcrumb({ message, level, data: context });

    // Development logging
    if (!this.isProduction) {
      const emoji = level === 'error' ? '🚨' : level === 'warn' ? '⚠️' : level === 'debug' ? '🐛' : 'ℹ️';
      console.log(`${emoji} [${level.toUpperCase()}]`, message, context || '');
    }

    return logData;
  }

  /**
   * Capture a message (non-error)
   */
  captureMessage(message: string, level: LogLevel = 'info', context?: ErrorContext) {
    return this.log(message, level, context);
  }

  /**
   * Add breadcrumb to tracking history
   */
  private addBreadcrumb(message: string, level: LogLevel) {
    this.breadcrumbs.push({
      timestamp: Date.now(),
      message,
      level,
    });

    // Keep only last N breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * Format error object for logging
   */
  private formatError(error: unknown) {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (typeof error === 'string') {
      return {
        name: 'StringError',
        message: error,
        stack: undefined,
      };
    }

    return {
      name: 'UnknownError',
      message: JSON.stringify(error),
      stack: undefined,
    };
  }

  /**
   * Get current breadcrumbs for debugging
   */
  getBreadcrumbs() {
    return [...this.breadcrumbs];
  }

  /**
   * Clear all breadcrumbs
   */
  clearBreadcrumbs() {
    this.breadcrumbs = [];
  }
}

// Export singleton instance
export const errorTracker = new ErrorTracker();

// Export types
export type { LogLevel, ErrorContext, User };
