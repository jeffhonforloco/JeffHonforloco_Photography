
import { useState } from 'react';
import Layout from '../components/Layout';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    sessionType: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 section-padding">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">Get in Touch</h1>
            <p className="text-gray-400 text-xl leading-relaxed">
              Ready to create something extraordinary? Let's discuss your photography needs 
              and bring your vision to life.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div className="animate-scale-in">
              <h2 className="text-3xl font-bold mb-8">Book a Session</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white focus:border-photo-red focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white focus:border-photo-red focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="sessionType" className="block text-sm font-medium mb-2">
                    Session Type
                  </label>
                  <select
                    id="sessionType"
                    name="sessionType"
                    value={formData.sessionType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white focus:border-photo-red focus:outline-none transition-colors"
                  >
                    <option value="">Select a session type</option>
                    <option value="beauty">Beauty Photography</option>
                    <option value="fashion">Fashion Photography</option>
                    <option value="editorial">Editorial Photography</option>
                    <option value="glamour">Glamour Photography</option>
                    <option value="lifestyle">Lifestyle Photography</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Project Details *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell me about your project, vision, timeline, and any specific requirements..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-700 text-white focus:border-photo-red focus:outline-none transition-colors resize-none"
                  />
                </div>

                <button type="submit" className="photo-button w-full">
                  Send Message
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold mb-8">Let's Connect</h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-photo-red">Response Time</h3>
                  <p className="text-gray-400 leading-relaxed">
                    I typically respond to inquiries within 24-48 hours. For urgent projects 
                    or time-sensitive bookings, please mention this in your message.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 text-photo-red">Session Planning</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Every project begins with a detailed consultation to understand your vision, 
                    goals, and requirements. This ensures we create exactly what you're looking for.
                  </p>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 text-photo-red">Social Media</h3>
                  <div className="space-y-3">
                    <a 
                      href="https://instagram.com/jeffhonforloco" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-gray-400 hover:text-photo-red transition-colors"
                    >
                      Instagram: @jeffhonforloco
                    </a>
                    <a 
                      href="https://youtube.com/@jeffhonforloco" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block text-gray-400 hover:text-photo-red transition-colors"
                    >
                      YouTube: @jeffhonforloco
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-4 text-photo-red">Availability</h3>
                  <p className="text-gray-400 leading-relaxed">
                    Currently booking 2-4 weeks in advance. Rush projects may be 
                    accommodated based on schedule availability.
                  </p>
                </div>
              </div>

              {/* Additional CTA */}
              <div className="mt-12 p-8 bg-gray-900 text-center">
                <h3 className="text-xl font-bold mb-4">Portfolio Review</h3>
                <p className="text-gray-400 mb-6">
                  Explore my work to get inspired for your upcoming project.
                </p>
                <a href="/portfolio" className="photo-button">
                  View Portfolio
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
