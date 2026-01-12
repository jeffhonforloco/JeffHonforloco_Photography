
import { useState, useEffect } from 'react';
import { Camera, Star, MapPin, Phone, Mail, CheckCircle, Users, Award, Clock } from 'lucide-react';
import Layout from '../components/Layout';
import { ContentData } from '@/types/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { trackContactForm, trackBookingIntent } from '../components/Analytics';
import { apiService } from '@/lib/api-service';

const Contact = () => {
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    projectDate: '',
    location: '',
    message: '',
    budget: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch('/data/jeff-content.json')
      .then(response => response.json())
      .then(data => setContentData(data))
      .catch(error => console.error('Error loading content:', error));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Track analytics
      trackContactForm(formData);
      trackBookingIntent('contact_form', formData.location);
      
      // Send email via API service
      const result = await apiService.sendContactEmail({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        service_type: formData.service,
        budget_range: formData.budget,
        event_date: formData.projectDate,
        location: formData.location
      });

      if (result.success) {
        toast({
          title: "Message sent successfully!",
          description: "Thank you for your inquiry. You'll receive a confirmation email shortly and I'll get back to you within 24 hours.",
        });
      } else {
        throw new Error(result?.error || 'Failed to send email');
      }
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        projectDate: '',
        location: '',
        message: '',
        budget: ''
      });
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Error",
        description: "There was an issue sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!contentData) {
    return (
      <Layout>
        <div className="py-20 section-padding">
          <div className="text-center">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* SEO Header */}
      <div className="sr-only">
        <h1>Book Luxury Fashion & Beauty Photography Sessions | Jeff Honforloco NYC</h1>
        <p>Book professional fashion, beauty, and editorial photography sessions. Available nationwide with premium service in NYC, LA, Miami, Chicago. Contact for luxury photography bookings.</p>
      </div>

      <div className="min-h-screen bg-black">
        {/* Hero Section - Mobile */}
        <div className="lg:hidden">
          <div className="pt-20 px-4 pb-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-playfair text-white mb-2 tracking-wide">
                Book Your Luxury Session
              </h1>
              <p className="text-gray-300 text-lg mb-6">
                Professional fashion & beauty photography nationwide
              </p>
              
              {/* Trust Indicators - Mobile */}
              <div className="flex justify-center gap-6 text-sm text-gray-400 mb-8">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-photo-red" />
                  <span>100+ Clients</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-photo-red" />
                  <span>100+ Clients</span>
                </div>
              </div>
            </div>
            
            {/* Portrait Image - Mobile */}
            <div className="relative max-w-xs mx-auto mb-8">
              <img
                src="/lovable-uploads/a1c7a9f7-09e2-44b4-9dbb-d807b674060c.png"
                alt="Jeff Honforloco - Luxury Fashion & Beauty Photographer"
                className="w-full aspect-[3/4] object-cover"
              />
              <div className="absolute -bottom-3 -right-3 w-full h-full border-4 border-photo-red -z-10"></div>
            </div>
          </div>

          {/* Contact Form - Mobile */}
          <div className="px-4 pb-12">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
              {/* Name Input */}
              <div>
                <label htmlFor="name-mobile" className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name <span className="text-photo-red">*</span>
                </label>
                <input
                  id="name-mobile"
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red focus:border-transparent rounded-lg"
                />
              </div>

              {/* Email and Phone Row */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="email-mobile" className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address <span className="text-photo-red">*</span>
                  </label>
                  <input
                    id="email-mobile"
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red focus:border-transparent rounded-lg"
                  />
                </div>
                <div>
                  <label htmlFor="phone-mobile" className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone-mobile"
                    type="tel"
                    name="phone"
                    placeholder="(555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red focus:border-transparent rounded-lg"
                  />
                </div>
              </div>

              {/* Project Details Row */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="service-mobile" className="block text-sm font-medium text-gray-300 mb-2">
                    Photography Service <span className="text-photo-red">*</span>
                  </label>
                  <select
                    id="service-mobile"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red rounded-lg appearance-none"
                    required
                  >
                    <option value="">Select a service</option>
                    <option value="Luxury Fashion Photography">Luxury Fashion Photography</option>
                    <option value="Beauty & Cosmetic Photography">Beauty & Cosmetic Photography</option>
                    <option value="Editorial Photography">Editorial Photography</option>
                    <option value="Celebrity & Portrait Photography">Celebrity & Portrait Photography</option>
                    <option value="Brand Campaign Photography">Brand Campaign Photography</option>
                    <option value="Custom Photography Project">Custom Photography Project</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="projectDate-mobile" className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Date
                  </label>
                  <input
                    id="projectDate-mobile"
                    type="date"
                    name="projectDate"
                    value={formData.projectDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="location-mobile" className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Location
                  </label>
                  <input
                    id="location-mobile"
                    type="text"
                    name="location"
                    placeholder="NYC, LA, Miami, etc."
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red rounded-lg"
                  />
                </div>

                <div>
                  <label htmlFor="budget-mobile" className="block text-sm font-medium text-gray-300 mb-2">
                    Investment Range
                  </label>
                  <select
                    id="budget-mobile"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red rounded-lg appearance-none"
                  >
                    <option value="">Select a range</option>
                    <option value="$2,000 - $5,000">$2,000 - $5,000</option>
                    <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                    <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                    <option value="$25,000+">$25,000+</option>
                    <option value="Discuss in consultation">Discuss in consultation</option>
                  </select>
                </div>
              </div>

              {/* Message Textarea */}
              <div>
                <label htmlFor="message-mobile" className="block text-sm font-medium text-gray-300 mb-2">
                  Project Details <span className="text-photo-red">*</span>
                </label>
                <textarea
                  id="message-mobile"
                  name="message"
                  placeholder="Tell me about your vision, goals, and any specific requirements for your photography session..."
                  required
                  rows={5}
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red rounded-lg resize-none"
                />
              </div>

              {/* Trust Signals */}
              <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-white text-sm font-medium">Professional Response Guaranteed</span>
                </div>
                <p className="text-gray-400 text-xs">
                  I personally respond to all inquiries within 24 hours. Your information is kept strictly confidential.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="bg-photo-red hover:bg-photo-red-hover text-white px-8 py-4 font-semibold text-sm uppercase tracking-wider transition-all duration-300 w-full rounded-lg hover:shadow-lg hover:shadow-photo-red/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Book Consultation Call'}
              </button>
              
              <p className="text-gray-500 text-xs text-center">
                Free consultation • No obligation • Immediate response
              </p>
            </form>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          {/* Hero Section - Desktop */}
          <div className="pt-32 pb-16">
            <div className="max-w-7xl mx-auto px-8">
              <div className="text-center mb-12">
                <h1 className="text-6xl md:text-7xl font-playfair text-white mb-4 tracking-wide">
                  Book Your Luxury Session
                </h1>
                <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                  Professional fashion, beauty & editorial photography available nationwide. 
                  Serving high-end clients in NYC, LA, Miami, Chicago, and worldwide.
                </p>
                
                {/* Trust Indicators - Desktop */}
                <div className="flex justify-center gap-12 mt-8 text-gray-400">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-photo-red" />
                    <span className="text-sm">100+ Happy Clients</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-photo-red" />
                    <span className="text-sm">24hr Response Time</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-8 pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-20 items-start">
                {/* Enhanced Contact Form - Desktop */}
                <div className="max-w-lg">
                  <div className="mb-8">
                    <h2 className="text-2xl font-playfair text-white mb-4">Start Your Project</h2>
                    <p className="text-gray-300 leading-relaxed">
                      Ready to create stunning photography that elevates your brand? Let's discuss your vision and bring it to life.
                    </p>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name and Email Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="name-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                          Full Name <span className="text-photo-red">*</span>
                        </label>
                        <input
                          id="name-desktop"
                          type="text"
                          name="name"
                          placeholder="Enter your full name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red focus:border-transparent rounded-lg"
                        />
                      </div>
                      <div>
                        <label htmlFor="email-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                          Email Address <span className="text-photo-red">*</span>
                        </label>
                        <input
                          id="email-desktop"
                          type="email"
                          name="email"
                          placeholder="your@email.com"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red focus:border-transparent rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Phone and Service Type */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="phone-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                          Phone Number
                        </label>
                        <input
                          id="phone-desktop"
                          type="tel"
                          name="phone"
                          placeholder="(555) 123-4567"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red focus:border-transparent rounded-lg"
                        />
                      </div>
                      <div>
                        <label htmlFor="service-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                          Photography Service <span className="text-photo-red">*</span>
                        </label>
                        <select
                          id="service-desktop"
                          name="service"
                          value={formData.service}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red rounded-lg appearance-none"
                          required
                        >
                          <option value="">Select a service</option>
                          <option value="Luxury Fashion Photography">Luxury Fashion Photography</option>
                          <option value="Beauty & Cosmetic Photography">Beauty & Cosmetic Photography</option>
                          <option value="Editorial Photography">Editorial Photography</option>
                          <option value="Celebrity & Portrait Photography">Celebrity & Portrait Photography</option>
                          <option value="Brand Campaign Photography">Brand Campaign Photography</option>
                          <option value="Custom Photography Project">Custom Photography Project</option>
                        </select>
                      </div>
                    </div>

                    {/* Date and Location */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="projectDate-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                          Preferred Date
                        </label>
                        <input
                          id="projectDate-desktop"
                          type="date"
                          name="projectDate"
                          value={formData.projectDate}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red rounded-lg"
                        />
                      </div>
                      <div>
                        <label htmlFor="location-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                          Preferred Location
                        </label>
                        <input
                          id="location-desktop"
                          type="text"
                          name="location"
                          placeholder="NYC, LA, Miami, etc."
                          value={formData.location}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Budget */}
                    <div>
                      <label htmlFor="budget-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                        Investment Range
                      </label>
                      <select
                        id="budget-desktop"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-900 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red rounded-lg appearance-none"
                      >
                        <option value="">Select a range</option>
                        <option value="$2,000 - $5,000">$2,000 - $5,000</option>
                        <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                        <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                        <option value="$25,000+">$25,000+</option>
                        <option value="Discuss in consultation">Discuss in consultation</option>
                      </select>
                    </div>

                    {/* Message Textarea */}
                    <div>
                      <label htmlFor="message-desktop" className="block text-sm font-medium text-gray-300 mb-2">
                        Project Details <span className="text-photo-red">*</span>
                      </label>
                      <textarea
                        id="message-desktop"
                        name="message"
                        placeholder="Tell me about your vision, goals, and any specific requirements for your photography session..."
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red rounded-lg resize-none"
                      />
                    </div>

                    {/* Trust Signals */}
                    <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-white text-sm font-medium">Professional Response Guaranteed</span>
                      </div>
                      <p className="text-gray-400 text-xs">
                        I personally respond to all inquiries within 24 hours. Your information is kept strictly confidential.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-photo-red hover:bg-photo-red-hover text-white px-8 py-4 font-semibold text-sm uppercase tracking-wider transition-all duration-300 w-full rounded-lg hover:shadow-lg hover:shadow-photo-red/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Sending...' : 'Book Consultation Call'}
                    </button>
                    
                    <p className="text-gray-500 text-xs text-center">
                      Free consultation • No obligation • Immediate response
                    </p>
                  </form>
                </div>

                {/* Enhanced Portrait Section with Contact Info */}
                <div className="relative lg:ml-8">
                  <div className="relative max-w-md mx-auto lg:mx-0 mb-8">
                    <img
                      src="/lovable-uploads/a1c7a9f7-09e2-44b4-9dbb-d807b674060c.png"
                      alt="Jeff Honforloco - Luxury Fashion & Beauty Photographer"
                      className="w-full aspect-[4/5] object-cover rounded-lg"
                    />
                    <div className="absolute -bottom-4 -right-4 w-full h-full border-4 border-photo-red -z-10 rounded-lg"></div>
                  </div>
                  
                  {/* Contact Information */}
                  <div className="space-y-4 text-white">
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-photo-red" />
                      <span className="text-gray-300">+646-379-4237</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-photo-red" />
                      <span className="text-gray-300">info@jeffhonforlocophotos.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-photo-red" />
                      <span className="text-gray-300">Based in Providence, RI • Available Worldwide</span>
                    </div>
                  </div>
                  
                  {/* Service Areas */}
                  <div className="mt-8 p-6 bg-gray-900 rounded-lg border border-gray-700">
                    <h3 className="text-white font-semibold mb-4">Primary Service Areas</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                      <div>• New York City</div>
                      <div>• Los Angeles</div>
                      <div>• Miami</div>
                      <div>• Chicago</div>
                      <div>• Atlanta</div>
                      <div>• Worldwide Travel</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Notice */}
        <div className="text-center pb-8 px-8">
          <p className="text-gray-500 text-sm">
            © 2025 Jeff Honforloco Photography. All rights reserved.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
