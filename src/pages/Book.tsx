import Layout from '../components/Layout';
import EmailSignup from '../components/EmailSignup';
import SEO from '../components/SEO';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Star, Users, Award } from 'lucide-react';

const Book = () => {
  return (
    <Layout>
      <SEO 
        title="Book Your Session - Jeff Honforloco Photography"
        description="Ready to elevate your brand, campaign, or portfolio? Book a consultation with luxury photographer Jeff Honforloco."
        url="/book"
      />
      
      <main className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Let's Create Magic Together
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Ready to elevate your brand, campaign, or portfolio with luxury photography 
              that captures your unique vision?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
                onClick={() => document.getElementById('email-signup')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Start the Conversation
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg"
                onClick={() => window.location.href = '/contact'}
              >
                Direct Inquiry
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-gradient-to-br from-gray-900 to-black">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
              What You Get When You Work With Jeff
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <Camera className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-white">Creative Direction</h3>
                  <p className="text-gray-300">Full moodboarding and concept development tailored to your vision</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <Star className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-white">Luxury Experience</h3>
                  <p className="text-gray-300">Professional styling, lighting, and premium service throughout</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-white">Expert Team</h3>
                  <p className="text-gray-300">Access to top-tier makeup artists, stylists, and creative professionals</p>
                </CardContent>
              </Card>
              
              <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <Award className="w-12 h-12 text-white mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3 text-white">Gallery-Ready Results</h3>
                  <p className="text-gray-300">Professional retouching and images that exceed your expectations</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Email Signup Section */}
        <div id="email-signup">
          <EmailSignup />
        </div>

        {/* Benefits Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Join the Community & Get Exclusive Access
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="text-4xl mb-4">📸</div>
                <h3 className="text-xl font-semibold mb-2">Free Prep Guide</h3>
                <p className="text-gray-300">Ultimate model preparation guide to look like a cover star</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-semibold mb-2">Early Access</h3>
                <p className="text-gray-300">First access to booking windows and special offers</p>
              </div>
              
              <div className="text-center">
                <div className="text-4xl mb-4">💡</div>
                <h3 className="text-xl font-semibold mb-2">Pro Tips</h3>
                <p className="text-gray-300">Behind-the-scenes insights and photography secrets</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 max-w-2xl mx-auto">
              No spam, ever. You'll receive valuable content and updates about Jeff's work. 
              Unsubscribe anytime with one click.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Book;