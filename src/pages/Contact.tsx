
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { ContentData } from '@/types/content';

const Contact = () => {
  const [contentData, setContentData] = useState<ContentData | null>(null);
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
        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Portrait Image - Mobile First */}
          <div className="pt-20 px-4">
            <div className="relative max-w-xs mx-auto">
              <img
                src="/lovable-uploads/a1c7a9f7-09e2-44b4-9dbb-d807b674060c.png"
                alt="Jeff Honforloco Portrait"
                className="w-full aspect-[3/4] object-cover"
              />
              {/* Red Border Accent */}
              <div className="absolute -bottom-3 -right-3 w-full h-full border-4 border-photo-red -z-10"></div>
            </div>
          </div>

          {/* Header */}
          <div className="pt-8 pb-6 px-4">
            <div className="text-center">
              <h1 className="text-3xl font-serif text-white mb-1 tracking-wide">
                CONTACT
              </h1>
              <h2 className="text-3xl font-serif text-white tracking-wide">
                JEFF HONFORLOCO
              </h2>
            </div>
          </div>

          {/* Contact Form - Mobile */}
          <div className="px-4 pb-12">
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
              {/* Name Input */}
              <input
                type="text"
                name="name"
                placeholder="Name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white text-black placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-photo-red"
              />
              
              {/* Email Input */}
              <input
                type="email"
                name="email"
                placeholder="Email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white text-black placeholder-gray-500 border-0 focus:outline-none focus:ring-2 focus:ring-photo-red"
              />

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
                rows={6}
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
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-medium text-sm uppercase tracking-wider transition-colors duration-300 w-full"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block">
          {/* Header */}
          <div className="pt-32 pb-16">
            <div className="max-w-7xl mx-auto px-8">
              <h1 className="text-5xl md:text-6xl font-serif text-white mb-2 tracking-wide">
                CONTACT
              </h1>
              <h2 className="text-5xl md:text-6xl font-serif text-white tracking-wide">
                JEFF HONFORLOCO
              </h2>
            </div>
          </div>

          {/* Main Content */}
          <div className="px-8 pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-20 items-start">
                {/* Contact Form */}
                <div className="max-w-lg">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name and Email Row */}
                    <div className="grid grid-cols-2 gap-4">
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
                      rows={6}
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
                      className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 font-medium text-sm uppercase tracking-wider transition-colors duration-300 w-full"
                    >
                      Send Message
                    </button>
                  </form>
                </div>

                {/* Portrait Image */}
                <div className="relative lg:ml-8">
                  <div className="relative max-w-md mx-auto lg:mx-0">
                    <img
                      src="/lovable-uploads/a1c7a9f7-09e2-44b4-9dbb-d807b674060c.png"
                      alt="Jeff Honforloco Portrait"
                      className="w-full aspect-[4/5] object-cover"
                    />
                    {/* Red Border Accent */}
                    <div className="absolute -bottom-4 -right-4 w-full h-full border-4 border-photo-red -z-10"></div>
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
