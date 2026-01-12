# Error Tracking Setup Guide

## Overview

The portfolio now includes a foundational error tracking system that can be easily extended with services like Sentry or LogRocket.

---

## Current Implementation

### Error Tracker Utility (`src/lib/error-tracking.ts`)

A centralized error tracking utility that provides:
- ✅ Error capturing and logging
- ✅ Event tracking
- ✅ User context management
- ✅ Breadcrumb trail
- ✅ Development/production mode handling
- ✅ Ready for Sentry/LogRocket integration

### ErrorBoundary Integration

The `ErrorBoundary` component now uses the centralized error tracker:
```typescript
import { errorTracker } from '@/lib/error-tracking';

errorTracker.captureError(error, {
  component: 'ErrorBoundary',
  componentStack: errorInfo.componentStack,
  fatal: true,
});
```

---

## Usage Examples

### 1. Capture Errors

```typescript
import { errorTracker } from '@/lib/error-tracking';

try {
  // Your code
  await apiCall();
} catch (error) {
  errorTracker.captureError(error, {
    component: 'ContactForm',
    action: 'submit',
    formData: { /* sanitized data */ },
  });
}
```

### 2. Log Events

```typescript
// Track user actions
errorTracker.logEvent('form_submitted', {
  formName: 'contact',
  hasPhone: true,
});

// Track navigation
errorTracker.logEvent('page_viewed', {
  page: '/portfolio/fashion',
});
```

### 3. Set User Context

```typescript
// When user logs in or provides info
errorTracker.setUser({
  id: 'user_123',
  email: 'user@example.com',
  name: 'John Doe',
});

// Clear user context on logout
errorTracker.setUser(null);
```

### 4. Log Messages

```typescript
// Info level
errorTracker.log('Image loaded successfully', 'info', {
  component: 'ImageGallery',
  imageId: '123',
});

// Warning level
errorTracker.log('Slow API response', 'warn', {
  endpoint: '/api/contact',
  duration: 5000,
});

// Error level (non-exception)
errorTracker.log('Validation failed', 'error', {
  field: 'email',
  value: 'invalid-email',
});
```

---

## Future Integration: Sentry

### Step 1: Install Sentry

```bash
npm install @sentry/react
```

### Step 2: Initialize in `main.tsx`

```typescript
import * as Sentry from '@sentry/react';
import { errorTracker } from '@/lib/error-tracking';

// Initialize Sentry
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: 'production',
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

// Initialize error tracker
errorTracker.initialize({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
});
```

### Step 3: Update `error-tracking.ts`

Uncomment the Sentry integration code blocks:

```typescript
// In initialize()
if (config?.dsn) {
  Sentry.init({
    dsn: config.dsn,
    environment: config.environment || 'production',
    integrations: [new Sentry.BrowserTracing()],
    tracesSampleRate: 1.0,
  });
}

// In setUser()
Sentry.setUser(user);

// In captureError()
Sentry.captureException(error, { contexts: { custom: fullContext } });

// In log()
Sentry.addBreadcrumb({ message, level, data: context });
```

### Step 4: Add Environment Variable

Create `.env.local`:
```
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

---

## Future Integration: LogRocket

### Step 1: Install LogRocket

```bash
npm install logrocket
npm install logrocket-react
```

### Step 2: Initialize in `main.tsx`

```typescript
import LogRocket from 'logrocket';
import setupLogRocketReact from 'logrocket-react';

if (import.meta.env.PROD) {
  LogRocket.init('your-app-id/your-app-name');
  setupLogRocketReact(LogRocket);
}
```

### Step 3: Update `error-tracking.ts`

```typescript
import LogRocket from 'logrocket';

// In setUser()
LogRocket.identify(user?.id || '', {
  name: user?.name,
  email: user?.email,
});

// In logEvent()
LogRocket.track(eventName, properties);
```

### Step 4: Link with Sentry (Optional)

```typescript
// In main.tsx
Sentry.init({
  // ...other config
  beforeSend(event) {
    event.extra = event.extra || {};
    event.extra.sessionURL = LogRocket.sessionURL;
    return event;
  },
});
```

---

## Migration Plan

### Phase 1: Current State ✅
- [x] Centralized error tracking utility
- [x] ErrorBoundary integration
- [x] Development logging
- [x] Breadcrumb tracking
- [x] User context support

### Phase 2: Production Setup (When Ready)
- [ ] Choose error tracking service (Sentry recommended)
- [ ] Set up Sentry project
- [ ] Add environment variables
- [ ] Uncomment integration code
- [ ] Test in staging environment
- [ ] Deploy to production

### Phase 3: Advanced Features (Optional)
- [ ] Add LogRocket for session replay
- [ ] Set up custom error pages
- [ ] Configure alert rules in Sentry
- [ ] Add performance monitoring
- [ ] Set up error budgets and SLOs

---

## Best Practices

### 1. Don't Log Sensitive Data

```typescript
// ❌ Bad
errorTracker.captureError(error, {
  password: formData.password,
  creditCard: formData.cc,
});

// ✅ Good
errorTracker.captureError(error, {
  formFields: ['name', 'email', 'phone'],
  hasPaymentInfo: !!formData.cc,
});
```

### 2. Add Meaningful Context

```typescript
// ❌ Bad
errorTracker.captureError(error);

// ✅ Good
errorTracker.captureError(error, {
  component: 'BookingSystem',
  step: 'payment',
  action: 'submit',
  bookingId: booking.id,
});
```

### 3. Use Appropriate Log Levels

```typescript
// Info: Normal operations
errorTracker.log('Form submitted', 'info');

// Warn: Something unexpected but not broken
errorTracker.log('API latency high', 'warn');

// Error: Something is broken
errorTracker.log('API request failed', 'error');
```

### 4. Set User Context Early

```typescript
// In auth callback or form submission
useEffect(() => {
  if (user) {
    errorTracker.setUser({
      email: user.email,
      // Don't include password or sensitive data
    });
  }
}, [user]);
```

---

## Development vs Production

### Development Mode
- Logs to console with emojis
- Detailed error information
- Breadcrumbs visible
- No external service calls

### Production Mode
- Minimal console output
- Errors sent to Sentry/LogRocket (when configured)
- User-friendly error pages
- Session replay available (if LogRocket configured)

---

## Testing

### Manual Testing

1. **Test Error Capture:**
```typescript
// In any component
throw new Error('Test error for tracking');
```

2. **Test Event Logging:**
```typescript
errorTracker.logEvent('test_event', { test: true });
```

3. **Check Console:**
- Development: Should see formatted logs
- Production: Should see minimal output

### Check Breadcrumbs

```typescript
// In browser console
import { errorTracker } from '@/lib/error-tracking';
console.log(errorTracker.getBreadcrumbs());
```

---

## Monitoring Dashboard (Future)

Once Sentry is integrated, you'll have access to:
- Real-time error tracking
- Error frequency and trends
- User impact analysis
- Stack traces and breadcrumbs
- Release tracking
- Performance monitoring

---

## Support & Resources

- **Sentry Documentation:** https://docs.sentry.io/platforms/javascript/guides/react/
- **LogRocket Documentation:** https://docs.logrocket.com/docs
- **Internal:** Check `src/lib/error-tracking.ts` for implementation details

---

**Status:** Foundation complete, ready for Sentry/LogRocket integration
**Next Step:** Set up Sentry project and add DSN when ready for production
