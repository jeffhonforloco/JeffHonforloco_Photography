import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

const About = () => {
  const [contentData, setContentData] = useState<any>(null);

  useEffect(() => {
    fetch('/data/jeff-content.json')
      .then(response => response.json())
      .then(data => setContentData(data))
      .catch(error => console.error('Error loading content:', error));
  }, []);

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
      {/* Main Hero Section */}
      <section className="min-h-screen bg-photo-black text-white pt-20 md:pt-24">
        <div className="max-w-8xl mx-auto px-8 md:px-16 py-20 md:py-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center min-h-[70vh]">
            {/* Left Column - Text Content */}
            <div className="lg:pr-12">
              <h1 className="font-bold text-5xl md:text-6xl lg:text-7xl leading-tight mb-8 tracking-tight">
                PHOTOGRAPHER,<br />
                CREATIVE,<br />
                <span className="text-photo-red">AND ENTREPRENEUR</span>
              </h1>
              
              <div className="space-y-6 text-gray-300 text-lg leading-relaxed max-w-2xl">
                <p>
                  Specializing in fashion and beauty photography, Jeff is a hyper-creative photographer 
                  and astute businessman with over 15+ years of experience. Based in Providence, RI area, USA, 
                  he has traveled extensively creating compelling visual stories for brands and high-end 
                  editorial publications.
                </p>
                
                <p>
                  With over a decade of experience in professional photography, I've dedicated my career to 
                  creating compelling visual stories that capture the essence and beauty of my subjects. 
                  My work spans across fashion, beauty, editorial, and lifestyle photography. Jeff is known 
                  for his signature bold, clean, and graphic style. Driven by his passion to be a visual 
                  problem solver and his love for creative collaboration, he utilizes his best-in-class crew 
                  and production resources to push boundaries and lift his commissioned and personal work.
                </p>
                
                <p>
                  With 50+ published works and 100+ happy clients, Jeff continues to create timeless imagery 
                  that captures the essence and beauty of his subjects while maintaining artistic integrity 
                  and technical excellence.
                </p>
              </div>
              
              <div className="mt-12 pt-8 border-t border-gray-700">
                <blockquote className="italic text-xl text-gray-400 font-light">
                  "{contentData.personal.quote}"
                </blockquote>
                <cite className="block mt-4 text-sm text-gray-500 not-italic">
                  — {contentData.personal.name}
                </cite>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="lg:pl-12">
              <div className="relative">
                {/* Main Image Container with Red Border */}
                <div className="relative bg-gradient-to-br from-photo-red/20 to-photo-red/5 p-1 rounded-lg">
                  <div className="bg-black rounded-lg overflow-hidden">
                    <img
                      src="/lovable-uploads/be7f5d35-71c0-4752-8fbe-46cd1a9e1fdd.png"
                      alt={contentData.personal.name}
                      className="w-full aspect-[4/5] object-cover rounded-lg"
                    />
                  </div>
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -top-4 -left-4 w-20 h-20 border-2 border-photo-red/30 rounded-full"></div>
                <div className="absolute -bottom-6 -right-6 w-16 h-16 bg-photo-red/20 rounded-lg rotate-45"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      <section className="py-20 md:py-32 bg-photo-gray-900">
        <div className="max-w-6xl mx-auto px-8 md:px-16">
          <div className="text-center mb-16">
            <h2 className="font-bold text-4xl md:text-5xl text-white mb-6">
              Behind the Lens
            </h2>
            <p className="text-gray-400 text-xl max-w-3xl mx-auto">
              Get to know Jeff's creative process and philosophy behind his award-winning photography work.
            </p>
          </div>
          
          {/* Video Placeholder */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-photo-red/20">
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-photo-red/10 to-transparent">
              <div className="text-center">
                <div className="w-20 h-20 bg-photo-red/20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <svg className="w-8 h-8 text-photo-red" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <p className="text-gray-400">Featured Video Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 md:py-32 bg-photo-black">
        <div className="max-w-6xl mx-auto px-8 md:px-16">
          <div className="text-center mb-16">
            <h2 className="font-bold text-4xl md:text-5xl text-white mb-6">
              Services
            </h2>
            <div className="w-24 h-1 bg-photo-red mx-auto mb-8"></div>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contentData.services.map((service: string, index: number) => (
              <div key={index} className="bg-photo-gray-900 p-8 rounded-lg hover:bg-photo-gray-800 transition-all duration-300 hover:transform hover:scale-105">
                <h3 className="text-xl font-bold mb-4 text-photo-red capitalize">{service}</h3>
                <p className="text-gray-400 leading-relaxed">
                  Professional {service.toLowerCase()} services with artistic vision and technical excellence that brings your creative vision to life.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 md:py-32 bg-photo-gray-900">
        <div className="text-center max-w-4xl mx-auto px-8 md:px-16">
          <h2 className="font-bold text-4xl md:text-5xl text-white mb-8">
            Let's Create Something <span className="text-photo-red">Amazing</span> Together
          </h2>
          <p className="text-gray-400 text-xl mb-12 leading-relaxed max-w-3xl mx-auto">
            Ready to bring your creative vision to life? Whether you're looking for fashion photography, 
            beauty shoots, or custom creative projects, let's collaborate to create something extraordinary.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="/contact" className="bg-photo-red hover:bg-photo-red-hover text-white px-12 py-4 font-semibold tracking-wide uppercase text-sm transition-all duration-300 hover:scale-105 rounded-lg">
              Start Your Project
            </a>
            <a href="/portfolio" className="border-2 border-photo-red text-photo-red hover:bg-photo-red hover:text-white px-12 py-4 font-semibold tracking-wide uppercase text-sm transition-all duration-300 hover:scale-105 rounded-lg">
              View Portfolio
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;