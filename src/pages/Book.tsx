import Layout from '../components/Layout';
import BookingSystem from '../components/BookingSystem';
import SEO from '../components/SEO';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Star, Users, Award, CheckCircle, Clock, Sparkles } from 'lucide-react';

const Book = () => {
  return (
    <Layout>
      <SEO 
        title="Book Your Session - Jeff Honforloco Photography"
        description="Ready to elevate your brand, campaign, or portfolio? Book a consultation with luxury photographer Jeff Honforloco."
        url="/book"
      />
      
      <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white">
        {/* Hero Section */}
        <section className="relative pt-24 pb-12 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-photo-red/10 border border-photo-red/30 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-photo-red" />
              <span className="text-sm text-photo-red font-medium">Easy Booking Process</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Let's Create Magic Together
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Book your luxury photography session in just a few simple steps. 
              Professional service, stunning results, unforgettable experience.
            </p>
          </div>
        </section>

        {/* Booking System */}
        <section className="py-8 px-6">
          <BookingSystem />
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-gray-900/50 to-black/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              What You Get When You Work With Jeff
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-photo-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="w-8 h-8 text-photo-red" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Creative Direction</h3>
                  <p className="text-gray-300 text-sm">Full moodboarding and concept development tailored to your vision</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-photo-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="w-8 h-8 text-photo-red" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Luxury Experience</h3>
                  <p className="text-gray-300 text-sm">Professional styling, lighting, and premium service throughout</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-photo-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-photo-red" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Expert Team</h3>
                  <p className="text-gray-300 text-sm">Access to top-tier makeup artists, stylists, and creative professionals</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-photo-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-8 h-8 text-photo-red" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Gallery-Ready Results</h3>
                  <p className="text-gray-300 text-sm">Professional retouching and images that exceed your expectations</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">24hr Response</h3>
                <p className="text-gray-400 text-sm">Guaranteed response within 24 hours</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Flexible Scheduling</h3>
                <p className="text-gray-400 text-sm">Choose dates and times that work for you</p>
              </div>
              
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">100+ Happy Clients</h3>
                <p className="text-gray-400 text-sm">Trusted by brands and celebrities worldwide</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Book;