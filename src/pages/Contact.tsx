
import { useState } from 'react';
import { MapPin, Phone, Mail, CheckCircle, Users, Clock, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import { toast } from '@/components/ui/use-toast';
import { trackContactForm, trackBookingIntent } from '../components/Analytics';
import { apiService } from '@/lib/api-service';

const PROCESS_STEPS = [
  {
    step: '01',
    title: 'Submit Your Inquiry',
    description: 'Fill out the form with your project vision, date, and location preferences.',
  },
  {
    step: '02',
    title: 'Consultation Call',
    description: 'We connect within 24 hours to discuss your goals, creative direction, and investment.',
  },
  {
    step: '03',
    title: 'Create Together',
    description: 'We execute a world-class session and deliver stunning, brand-elevating imagery.',
  },
];

const SERVICE_AREAS = [
  'New York City',
  'Los Angeles',
  'Miami',
  'Chicago',
  'Atlanta',
  'Worldwide Travel',
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    projectDate: '',
    location: '',
    message: '',
    budget: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitError(null);

    try {
      trackContactForm(formData);
      trackBookingIntent('contact_form', formData.location);

      const result = await apiService.sendContactEmail({
        full_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message,
        service_type: formData.service,
        budget_range: formData.budget,
        event_date: formData.projectDate,
        location: formData.location,
      });

      if (result.success) {
        toast({
          title: 'Message sent successfully!',
          description:
            "Thank you for your inquiry. You'll receive a confirmation email shortly and I'll get back to you within 24 hours.",
        });
        setFormData({
          name: '',
          email: '',
          phone: '',
          service: '',
          projectDate: '',
          location: '',
          message: '',
          budget: '',
        });
      } else {
        throw new Error(result?.error || 'Failed to send email');
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'There was an issue sending your message. Please try again.';
      setSubmitError(message);
      toast({
        title: 'Error',
        description: 'There was an issue sending your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const inputClass =
    'w-full px-4 py-3 bg-gray-900 text-white placeholder-gray-400 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-photo-red focus:border-transparent rounded-lg';

  return (
    <Layout>
      <div className="sr-only">
        <h1>Book Fashion & Beauty Photography Sessions | Jeff Honforloco NYC</h1>
        <p>
          Book professional fashion, beauty, and editorial photography sessions. Available
          nationwide with premium service in NYC, LA, Miami, Chicago.
        </p>
      </div>

      <div className="min-h-screen bg-black">
        {/* Hero */}
        <div className="pt-24 pb-12 lg:pt-32 lg:pb-16 px-4 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-playfair text-white mb-4 tracking-wide">
              Book Your Session
            </h1>
            <p className="text-lg lg:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Professional fashion, beauty &amp; editorial photography available nationwide.
              Serving high-end clients in NYC, LA, Miami, Chicago, and worldwide.
            </p>

            <div className="flex justify-center gap-8 mt-8 text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-photo-red" />
                <span className="text-sm">100+ Happy Clients</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-photo-red" />
                <span className="text-sm">24hr Response Time</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 lg:px-8 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

              {/* Left — Form */}
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-playfair text-white mb-3">Start Your Project</h2>
                  <p className="text-gray-300 leading-relaxed">
                    Ready to create stunning photography that elevates your brand? Let's discuss
                    your vision and bring it to life.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name + Email */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name <span className="text-photo-red">*</span>
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address <span className="text-photo-red">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Phone + Service */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                        Phone Number
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        name="phone"
                        placeholder="(555) 123-4567"
                        value={formData.phone}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">
                        Photography Service <span className="text-photo-red">*</span>
                      </label>
                      <select
                        id="service"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        required
                        className={inputClass + ' appearance-none'}
                      >
                        <option value="">Select a service</option>
                        <option value="Fashion Photography">Fashion Photography</option>
                        <option value="Beauty & Cosmetic Photography">Beauty &amp; Cosmetic Photography</option>
                        <option value="Editorial Photography">Editorial Photography</option>
                        <option value="Celebrity & Portrait Photography">Celebrity &amp; Portrait Photography</option>
                        <option value="Brand Campaign Photography">Brand Campaign Photography</option>
                        <option value="Custom Photography Project">Custom Photography Project</option>
                      </select>
                    </div>
                  </div>

                  {/* Date + Location */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="projectDate" className="block text-sm font-medium text-gray-300 mb-2">
                        Preferred Date
                      </label>
                      <input
                        id="projectDate"
                        type="date"
                        name="projectDate"
                        value={formData.projectDate}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-300 mb-2">
                        Preferred Location
                      </label>
                      <input
                        id="location"
                        type="text"
                        name="location"
                        placeholder="NYC, LA, Miami, etc."
                        value={formData.location}
                        onChange={handleChange}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Budget */}
                  <div>
                    <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-2">
                      Investment Range
                    </label>
                    <select
                      id="budget"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className={inputClass + ' appearance-none'}
                    >
                      <option value="">Select a range</option>
                      <option value="$2,000 - $5,000">$2,000 – $5,000</option>
                      <option value="$5,000 - $10,000">$5,000 – $10,000</option>
                      <option value="$10,000 - $25,000">$10,000 – $25,000</option>
                      <option value="$25,000+">$25,000+</option>
                      <option value="Discuss in consultation">Discuss in consultation</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
                      Project Details <span className="text-photo-red">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Tell me about your vision, goals, and any specific requirements for your photography session..."
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className={inputClass + ' resize-none'}
                    />
                  </div>

                  {/* Error state */}
                  {submitError && (
                    <p className="text-photo-red text-sm" role="alert">
                      {submitError}
                    </p>
                  )}

                  {/* Trust signal */}
                  <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                      <span className="text-white text-sm font-medium">Professional Response Guaranteed</span>
                    </div>
                    <p className="text-gray-400 text-xs pl-7">
                      I personally respond to all inquiries within 24 hours. Your information is kept
                      strictly confidential.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-photo-red hover:bg-photo-red-hover text-white px-8 py-4 font-semibold text-sm uppercase tracking-wider transition-all duration-300 w-full rounded-lg hover:shadow-lg hover:shadow-photo-red/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Sending…' : 'Book Consultation Call'}
                  </button>

                  <p className="text-gray-500 text-xs text-center">
                    Free consultation &bull; No obligation &bull; Immediate response
                  </p>
                </form>
              </div>

              {/* Right — Info */}
              <div className="space-y-8">
                {/* Contact Details */}
                <div>
                  <h2 className="text-2xl font-playfair text-white mb-6">Get in Touch</h2>
                  <div className="space-y-4">
                    <a
                      href="tel:+16463794237"
                      className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
                    >
                      <span className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center group-hover:border-photo-red transition-colors shrink-0">
                        <Phone className="w-4 h-4 text-photo-red" />
                      </span>
                      +646-379-4237
                    </a>
                    <a
                      href="mailto:info@jeffhonforlocophotos.com"
                      className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors group"
                    >
                      <span className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center group-hover:border-photo-red transition-colors shrink-0">
                        <Mail className="w-4 h-4 text-photo-red" />
                      </span>
                      info@jeffhonforlocophotos.com
                    </a>
                    <div className="flex items-center gap-3 text-gray-300">
                      <span className="w-10 h-10 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-photo-red" />
                      </span>
                      Based in Providence, RI &bull; Available Worldwide
                    </div>
                  </div>
                </div>

                {/* Service Areas */}
                <div className="p-6 bg-gray-900 rounded-lg border border-gray-700">
                  <h3 className="text-white font-semibold mb-4">Primary Service Areas</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                    {SERVICE_AREAS.map((area) => (
                      <div key={area} className="flex items-center gap-1">
                        <span className="text-photo-red text-xs">•</span> {area}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Process */}
                <div>
                  <h3 className="text-white font-semibold mb-5">What to Expect</h3>
                  <div className="space-y-5">
                    {PROCESS_STEPS.map((item, idx) => (
                      <div key={item.step} className="flex gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-photo-red/10 border border-photo-red/30 flex items-center justify-center">
                          <span className="text-photo-red text-xs font-bold">{item.step}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white text-sm font-semibold">{item.title}</h4>
                            {idx < PROCESS_STEPS.length - 1 && (
                              <ArrowRight className="w-3 h-3 text-gray-600 hidden" />
                            )}
                          </div>
                          <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="text-center pb-8 px-8">
          <p className="text-gray-500 text-sm">
            &copy; 2026 Jeff Honforloco Photography. All rights reserved.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
