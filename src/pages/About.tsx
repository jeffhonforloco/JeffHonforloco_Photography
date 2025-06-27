
import Layout from '../components/Layout';

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 section-padding">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold mb-8">About Jeff</h1>
            <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
              <p>
                With over a decade of experience in professional photography, I've dedicated 
                my career to creating compelling visual stories that capture the essence and 
                beauty of my subjects. My work spans across fashion, beauty, editorial, and 
                lifestyle photography.
              </p>
              <p>
                Every photograph is an opportunity to tell a story, to freeze a moment in time 
                that speaks to the viewer on an emotional level. I believe in combining technical 
                precision with artistic vision to deliver images that not only meet client 
                expectations but exceed them.
              </p>
              <p>
                My approach to photography is collaborative and intuitive. I work closely with 
                clients, models, and creative teams to ensure that every shoot produces authentic, 
                striking imagery that serves its intended purpose while maintaining artistic integrity.
              </p>
            </div>
          </div>
          <div className="animate-scale-in">
            <img
              src="https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Jeff Honforloco"
              className="w-full h-[700px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 section-padding bg-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Artistic Philosophy</h2>
          <blockquote className="text-2xl text-gray-300 leading-relaxed italic mb-8">
            "Photography is not just about capturing what you see—it's about revealing 
            what others might miss. Every frame is an opportunity to create something 
            timeless and meaningful."
          </blockquote>
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 text-photo-red">Authenticity</h3>
              <p className="text-gray-400">
                Creating genuine connections and capturing real emotions that translate 
                into powerful imagery.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 text-photo-red">Innovation</h3>
              <p className="text-gray-400">
                Constantly exploring new techniques, styles, and creative approaches 
                to visual storytelling.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-4 text-photo-red">Excellence</h3>
              <p className="text-gray-400">
                Maintaining the highest standards in every aspect of the creative process, 
                from concept to final delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Experience & Recognition */}
      <section className="py-20 section-padding">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Experience & Recognition</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-6 text-photo-red">Professional Experience</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Fashion & Editorial Photography</h4>
                  <p className="text-gray-400">
                    Over 10 years of experience working with fashion brands, magazines, 
                    and creative agencies on editorial and commercial projects.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Beauty & Portrait Specialist</h4>
                  <p className="text-gray-400">
                    Specialized expertise in beauty and portrait photography with focus 
                    on lighting, composition, and post-production excellence.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Creative Collaborations</h4>
                  <p className="text-gray-400">
                    Extensive experience collaborating with models, stylists, makeup artists, 
                    and creative directors on diverse projects.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-6 text-photo-red">Approach & Style</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Technical Excellence</h4>
                  <p className="text-gray-400">
                    Mastery of professional camera systems, lighting equipment, and 
                    post-production workflows to deliver exceptional results.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Artistic Vision</h4>
                  <p className="text-gray-400">
                    Unique perspective that blends contemporary trends with timeless 
                    aesthetics to create memorable imagery.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Client-Focused Service</h4>
                  <p className="text-gray-400">
                    Dedicated to understanding client needs and delivering results that 
                    exceed expectations while maintaining artistic integrity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 section-padding bg-gray-900">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Let's Create Something Amazing Together</h2>
          <p className="text-gray-400 text-lg mb-8 leading-relaxed">
            Whether you're looking for professional portraits, fashion photography, 
            or creative editorial work, I'm here to bring your vision to life with 
            technical expertise and artistic passion.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contact" className="photo-button">
              Book a Session
            </a>
            <a href="/portfolio" className="border border-photo-red text-photo-red hover:bg-photo-red hover:text-white px-8 py-3 font-medium transition-all duration-300">
              View Portfolio
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
