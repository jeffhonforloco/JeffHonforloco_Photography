
import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Analytics from "./components/Analytics";
import PerformanceMonitor from "./components/PerformanceMonitor";
import ErrorBoundary from "./components/common/ErrorBoundary";
import SalesChatbot from "./components/SalesChatbot";
import { initializeImageOptimization } from "./utils/performanceOptimizer";

// Lazy load all pages for better performance
const Index = lazy(() => import("./pages/Index"));
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

// Loading component
const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-photo-red"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,   // 5 min — avoid redundant refetches
      gcTime: 10 * 60 * 1000,     // 10 min — keep cache warm
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  React.useEffect(() => {
    initializeImageOptimization();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Analytics />
            <PerformanceMonitor />
            <SalesChatbot />
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
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
