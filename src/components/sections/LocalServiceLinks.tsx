import { Link } from 'react-router-dom';
import { SERVICE_AUTHORITY_LINKS } from '@/data/service-authority-data';

const LocalServiceLinks = () => (
  <section className="py-20 md:py-24 bg-photo-gray-900 border-y border-white/10" aria-labelledby="providence-services-heading">
    <div className="max-w-7xl mx-auto px-8 md:px-16">
      <p className="text-red-400 text-xs tracking-[0.32em] uppercase mb-4">Providence home base</p>
      <h2 id="providence-services-heading" className="font-playfair text-4xl md:text-5xl font-light mb-5">Photography services in Rhode Island</h2>
      <p className="text-gray-400 text-lg max-w-3xl leading-relaxed mb-9">Explore focused information, published pricing and portfolio examples for the service that matches your project.</p>
      <nav aria-label="Providence photography services" className="grid sm:grid-cols-2 lg:grid-cols-5 border-l border-t border-white/10">
        {SERVICE_AUTHORITY_LINKS.map((link) => (
          <Link key={link.path} to={link.path} className="group border-r border-b border-white/10 p-5 text-gray-200 hover:bg-white/5 hover:text-photo-red transition-colors">
            <span>{link.label}</span><span aria-hidden="true" className="ml-2 group-hover:ml-3 transition-all">→</span>
          </Link>
        ))}
      </nav>
    </div>
  </section>
);

export default LocalServiceLinks;
