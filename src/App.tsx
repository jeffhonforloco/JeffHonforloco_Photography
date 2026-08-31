
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Analytics from "./components/Analytics";
import RouteMetadata from "./components/RouteMetadata";
import PerformanceMonitor from "./components/PerformanceMonitor";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { initializeImageOptimization } from "./utils/performanceOptimizer";
import Index from "./pages/Index";

// Lazy load all pages for better performance
const Portfolio = lazy(() => import("./pages/Portfolio"));
const PortfolioCategory = lazy(() => import("./pages/PortfolioCategory"));
const Journal = lazy(() => import("./pages/Journal"));
const JournalArticle = lazy(() => import("./pages/JournalArticle"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const LocationLanding = lazy(() => import("./pages/LocationLanding"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const Book = lazy(() => import("./pages/Book"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PrepGuidePage = lazy(() => import("./pages/PrepGuide"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Services = lazy(() => import("./pages/Services"));
const SalesChatbot = lazy(() => import("./components/SalesChatbot"));
const Toaster = lazy(() => import("./components/ui/toaster").then((module) => ({ default: module.Toaster })));

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center" role="status" aria-label="Loading page">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-photo-red" aria-hidden="true"></div>
  </div>
);

const DeferredSalesChatbot = () => {
  const [shouldLoad, setShouldLoad] = React.useState(false);
  const { pathname } = useLocation();
  const isConversionPage = pathname === "/book" || pathname === "/contact";

  React.useEffect(() => {
    if (isConversionPage || shouldLoad || typeof window === "undefined") {
      return;
    }

    const loadChatbot = () => setShouldLoad(true);
    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown"];
    const listenerOptions: AddEventListenerOptions = { once: true, passive: true };

    events.forEach((eventName) => window.addEventListener(eventName, loadChatbot, listenerOptions));

    return () => {
      events.forEach((eventName) => window.removeEventListener(eventName, loadChatbot, listenerOptions));
    };
  }, [isConversionPage, shouldLoad]);

  if (isConversionPage || !shouldLoad) {
    return null;
  }

  return (
    <Suspense fallback={null}>
      <SalesChatbot />
    </Suspense>
  );
};

const DeferredToaster = () => {
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    const load = () => setShouldLoad(true);
    window.addEventListener("pointerdown", load, { once: true, passive: true });
    window.addEventListener("keydown", load, { once: true, passive: true });
    return () => {
      window.removeEventListener("pointerdown", load);
      window.removeEventListener("keydown", load);
    };
  }, []);

  return shouldLoad ? <Suspense fallback={null}><Toaster /></Suspense> : null;
};

export const AppContent = () => {
  React.useEffect(() => {
    initializeImageOptimization();
  }, []);

  return (
    <>
            <RouteMetadata />
            <Analytics />
            <PerformanceMonitor />
            <DeferredToaster />
            <DeferredSalesChatbot />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                {/* Redirect old portfolio route to new portfolios route */}
                <Route path="/portfolio" element={<Navigate to="/portfolios" replace />} />
                <Route path="/portfolio/motion" element={<Navigate to="/motion" replace />} />
                <Route path="/portfolio/:category" element={<Navigate to="/portfolios/:category" replace />} />
                <Route path="/portfolios" element={<Portfolio />} />
                <Route path="/portfolios/motion" element={<Navigate to="/motion" replace />} />
                <Route path="/portfolios/:category" element={<PortfolioCategory />} />
                <Route path="/motion" element={<PortfolioCategory categoryOverride="motion" />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/journal/:slug" element={<JournalArticle />} />
                <Route path="/about" element={<About />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/book" element={<Book />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/prep-guide" element={<PrepGuidePage />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {/* Location-specific landing pages */}
                <Route path="/location/:location" element={<LocationLanding />} />
                {/* Legacy location routes for SEO */}
                <Route path="/nyc" element={<LocationLanding />} />
                <Route path="/los-angeles" element={<LocationLanding />} />
                <Route path="/miami" element={<LocationLanding />} />
                <Route path="/paris" element={<LocationLanding />} />
                <Route path="/london" element={<LocationLanding />} />
                <Route path="/italy" element={<LocationLanding />} />
                <Route path="/lagos" element={<LocationLanding />} />
                <Route path="/switzerland" element={<LocationLanding />} />
                <Route path="/malta" element={<LocationLanding />} />
                <Route path="/monaco" element={<LocationLanding />} />
                {/* New England location routes */}
                <Route path="/rhode-island" element={<LocationLanding />} />
                <Route path="/massachusetts" element={<LocationLanding />} />
                <Route path="/maine" element={<LocationLanding />} />
                <Route path="/connecticut" element={<LocationLanding />} />
                {/* Admin Panel */}
                <Route path="/admin/*" element={<Admin />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
    </>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
