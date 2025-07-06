
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const Contact = () => {
  const [contentData, setContentData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiryType: '',
    message: ''
  });

  useEffect(() => {
    fetch('/data/jeff-content.json')
      .then(response => response.json())
      .then(data => setContentData(data))
      .catch(error => console.error('Error loading content:', error));
  }, []);

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
      <div className="min-h-screen bg-black">
        {/* Header */}
        <div className="pt-32 pb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-light text-white mb-2 tracking-wider">
            CONTACT
          </h1>
          <h2 className="text-5xl md:text-6xl font-light text-white tracking-wider">
            JEFF HONFORLOCO
          </h2>
        </div>

        {/* Main Content */}
        <div className="px-8 pb-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {/* Contact Form */}
              <div className="space-y-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Email Row */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white text-black placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-photo-red"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white text-black placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-photo-red"
                    />
                  </div>

                  {/* Inquiry Type Dropdown */}
                  <select
                    name="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white text-black border-0 focus:outline-none focus:ring-2 focus:ring-photo-red appearance-none"
                    required
                  >
                    <option value="">Inquiry type</option>
                    {contentData.services.map((service: string, index: number) => (
                      <option key={index} value={service}>
                        {service}
                      </option>
                    ))}
                  </select>

                  {/* Message Textarea */}
                  <textarea
                    name="message"
                    placeholder="Your message here"
                    required
                    rows={8}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white text-black placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-photo-red resize-none"
                  />

                  {/* reCAPTCHA Placeholder */}
                  <div className="bg-gray-100 p-4 border border-gray-300 flex items-center space-x-3">
                    <input type="checkbox" className="w-5 h-5" />
                    <span className="text-gray-700 text-sm">I am human</span>
                    <div className="ml-auto">
                      <div className="text-xs text-gray-500">reCAPTCHA</div>
                      <div className="text-xs text-gray-400">Privacy - Terms</div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-medium text-sm uppercase tracking-wider transition-colors duration-300"
                  >
                    Send Message
                  </button>
                </form>
              </div>

              {/* Portrait Image */}
              <div className="relative">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Jeff Honforloco Portrait"
                    className="w-full aspect-[4/5] object-cover"
                  />
                  {/* Red Border Accent */}
                  <div className="absolute -bottom-4 -right-4 w-full h-full border-4 border-photo-red -z-10"></div>
                </div>
              </div>
            </div>

            {/* Bottom Gallery Thumbnails */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-16">
              <img
                src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Portfolio Sample 1"
                className="w-full aspect-square object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Portfolio Sample 2"
                className="w-full aspect-square object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1500673922987-e212871fec22?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                alt="Portfolio Sample 3"
                className="w-full aspect-square object-cover md:block hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
