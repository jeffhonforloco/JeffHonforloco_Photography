
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Portfolio from "./pages/Portfolio";
import PortfolioCategory from "./pages/PortfolioCategory";
import Journal from "./pages/Journal";
import JournalArticle from "./pages/JournalArticle";
import About from "./pages/About";
import Contact from "./pages/Contact";
import LocationLanding from "./pages/LocationLanding";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Analytics from "./components/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Analytics />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/:category" element={<PortfolioCategory />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/journal/:slug" element={<JournalArticle />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
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
          {/* Admin Panel */}
          <Route path="/admin/*" element={<Admin />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
