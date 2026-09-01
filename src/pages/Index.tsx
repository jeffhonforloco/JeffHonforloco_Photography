import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import Layout from '../components/Layout';
import HeroSection from '../components/sections/HeroSection';
import SEO from '../components/SEO';

const HomepageBelowFold = lazy(() => import('../components/sections/HomepageBelowFold'));

const loadHomepageStyles = () => {
  const stylesheetMeta = document.querySelector<HTMLMetaElement>('meta[name="homepage-stylesheet"]');
  if (!stylesheetMeta?.content || document.querySelector('link[data-homepage-full-styles]')) return;

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = stylesheetMeta.content;
  stylesheet.dataset.homepageFullStyles = 'true';
  document.head.appendChild(stylesheet);
};

const Index = () => {
  const [showBelowFold, setShowBelowFold] = useState(false);
  const boundaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const boundary = boundaryRef.current;
    if (!boundary || !('IntersectionObserver' in window)) {
      const timeoutId = window.setTimeout(() => {
        loadHomepageStyles();
        setShowBelowFold(true);
      }, 0);
      return () => window.clearTimeout(timeoutId);
    }

    const revealBelowFold = () => {
      loadHomepageStyles();
      setShowBelowFold(true);
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        revealBelowFold();
        observer.disconnect();
      }
    }, { threshold: 1 });
    observer.observe(boundary);

    const interactionEvents: Array<keyof WindowEventMap> = ['pointerdown', 'keydown'];
    interactionEvents.forEach((eventName) => {
      window.addEventListener(eventName, loadHomepageStyles, { once: true, passive: true });
    });

    const revealEvents: Array<keyof WindowEventMap> = ['wheel', 'touchmove', 'scroll'];
    revealEvents.forEach((eventName) => {
      window.addEventListener(eventName, revealBelowFold, { once: true, passive: true });
    });
    const fallbackId = window.setTimeout(revealBelowFold, 12_000);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackId);
      interactionEvents.forEach((eventName) => window.removeEventListener(eventName, loadHomepageStyles));
      revealEvents.forEach((eventName) => window.removeEventListener(eventName, revealBelowFold));
    };
  }, []);

  return (
    <Layout>
      <SEO />
      <HeroSection />
      <div ref={boundaryRef} className="h-4" aria-hidden="true" />
      {showBelowFold && (
        <Suspense fallback={<div className="min-h-screen bg-black" aria-hidden="true" />}>
          <HomepageBelowFold />
        </Suspense>
      )}
    </Layout>
  );
};

export default Index;
