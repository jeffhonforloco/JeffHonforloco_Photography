import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowRight, Check, MapPin } from 'lucide-react';
import Layout from '@/components/Layout';
import { SERVICE_AUTHORITY_BY_PATH, SERVICE_AUTHORITY_LINKS } from '@/data/service-authority-data';

const ServiceAuthority = () => {
  const { pathname } = useLocation();
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const page = SERVICE_AUTHORITY_BY_PATH[normalizedPath];

  if (!page) return <Navigate to="/not-found" replace />;

  const imagePath = page.image.split('?')[0];
  const isAcquisitionImage = imagePath.startsWith('/images/acquisition/');
  const heroMedia = page.gallery?.find((image) => image.src === imagePath);
  const heroSrcSet = isAcquisitionImage
    ? (heroMedia?.variants ?? [480, 768, 1200, 1600]).map((width) => `${imagePath.replace(/-\d+\.webp$/, `-${width}.webp`)} ${width}w`).join(', ')
    : `${page.image.replace('-960.webp', '-480.webp')} 480w, ${page.image.replace('-960.webp', '-640.webp')} 640w, ${page.image} 960w`;

  return (
    <Layout>
      <article className="bg-photo-black text-white overflow-x-clip">
        <section className="pt-28 md:pt-36 pb-16 md:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
            <nav aria-label="Breadcrumb" className="mb-8 text-xs sm:text-sm text-gray-400">
              <ol className="flex min-w-0 flex-wrap items-center gap-2">
                <li><Link className="hover:text-photo-red" to="/">Home</Link></li>
                <li aria-hidden="true">/</li>
                <li><Link className="hover:text-photo-red" to="/services">Services</Link></li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="min-w-0 break-words text-gray-200">{page.h1}</li>
              </ol>
            </nav>

            <div className="grid min-w-0 lg:grid-cols-[1.05fr_.95fr] gap-12 lg:gap-20 items-center">
              <div className="min-w-0">
                <p className="font-inter text-xs tracking-[0.32em] text-red-400 uppercase mb-5">{page.eyebrow}</p>
                <h1 className="font-playfair text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-[1.04] break-words mb-8">{page.h1}</h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-300 font-light leading-relaxed mb-9">{page.introduction}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to={`/book?service=${page.pricingService}`} className="inline-flex min-w-0 max-w-full w-full sm:w-auto justify-center items-center gap-2 bg-photo-red hover:bg-photo-red-hover px-5 sm:px-7 py-4 text-sm font-medium text-center uppercase tracking-[0.1em] sm:tracking-[0.14em] transition-colors">
                    <span className="min-w-0 break-words">Request a session</span> <ArrowRight className="w-4 h-4 flex-none" />
                  </Link>
                  <Link to={page.portfolioPath} className="inline-flex min-w-0 max-w-full w-full sm:w-auto justify-center items-center border border-white/25 hover:border-white/60 px-5 sm:px-7 py-4 text-sm text-center uppercase tracking-[0.1em] sm:tracking-[0.14em] transition-colors">
                    <span className="min-w-0 break-words">{page.portfolioLabel}</span>
                  </Link>
                </div>
              </div>
              <figure>
                <img
                  src={page.image}
                  srcSet={heroSrcSet}
                  sizes="(max-width: 1023px) 100vw, 45vw"
                  alt={page.imageAlt}
                  width={heroMedia?.width ?? 960}
                  height={heroMedia?.height ?? 1200}
                  loading="eager"
                  decoding="async"
                  {...{ fetchpriority: 'high' }}
                  className="w-full aspect-[4/5] object-cover rounded-sm"
                />
              </figure>
            </div>
          </div>
        </section>

        <section className="py-20 bg-photo-gray-900 border-y border-white/10">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16 grid lg:grid-cols-2 gap-14 lg:gap-20">
            <div>
              <h2 className="font-playfair text-4xl md:text-5xl font-light mb-8">{page.audienceTitle}</h2>
              <ul className="space-y-4">
                {page.audiences.map((audience) => (
                  <li key={audience} className="flex gap-3 text-gray-300 leading-relaxed">
                    <Check className="w-5 h-5 text-photo-red flex-none mt-0.5" aria-hidden="true" />
                    <span>{audience}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-white/10 bg-black/40 p-7 md:p-9">
              <div className="flex items-center gap-3 text-red-400 mb-5"><MapPin className="w-5 h-5" /><span className="uppercase tracking-[0.2em] text-xs">Providence home base</span></div>
              <h2 className="font-playfair text-3xl md:text-4xl font-light mb-5">{page.secondaryTitle}</h2>
              {page.secondaryCopy.map((paragraph) => <p key={paragraph} className="text-gray-300 leading-relaxed mb-5 last:mb-0">{paragraph}</p>)}
            </div>
          </div>
        </section>

        {page.gallery && page.gallery.length > 0 && (
          <section className="py-20 md:py-28 bg-photo-gray-900 border-y border-white/10" aria-labelledby="service-gallery-title">
            <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
              <h2 id="service-gallery-title" className="font-playfair text-4xl md:text-5xl font-light mb-10">{page.galleryTitle}</h2>
              <div className="grid grid-cols-2 lg:grid-cols-12 gap-3 md:gap-5">
                {page.gallery.map((image, index) => {
                  const base = image.src.replace(/-\d+\.webp$/, '');
                  const widths = image.variants;
                  return (
                    <figure key={image.src} className={`${index === 0 ? 'col-span-2 lg:col-span-7 lg:row-span-2' : 'col-span-1 lg:col-span-5'} overflow-hidden bg-black`}>
                      <img
                        src={image.src}
                        srcSet={widths.map((width) => `${base}-${width}.webp ${width}w`).join(', ')}
                        sizes={index === 0 ? '(max-width: 1023px) 100vw, 58vw' : '(max-width: 1023px) 50vw, 42vw'}
                        width={image.width}
                        height={image.height}
                        alt={image.alt}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full min-h-56 md:min-h-72 object-cover transition-transform duration-700 hover:scale-[1.02]"
                      />
                    </figure>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className="py-20 md:py-28">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
            <h2 className="font-playfair text-4xl md:text-5xl font-light mb-12">{page.processTitle}</h2>
            <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {page.process.map((step, index) => (
                <li key={step.title} className="border-t border-photo-red pt-6">
                  <span className="text-red-400 text-sm">0{index + 1}</span>
                  <h3 className="font-playfair text-2xl mt-3 mb-3">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-20 bg-photo-gray-900 border-y border-white/10">
          <div className="max-w-5xl mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h2 className="font-playfair text-4xl font-light mb-7">{page.deliverablesTitle}</h2>
                <ul className="space-y-3 text-gray-300">
                  {page.deliverables.map((item) => <li key={item} className="flex gap-3"><span className="text-photo-red" aria-hidden="true">—</span>{item}</li>)}
                </ul>
              </div>
              <div>
                <h2 className="font-playfair text-4xl font-light mb-7">Pricing and next steps</h2>
                <p className="text-gray-300 leading-relaxed mb-7">{page.pricingCopy}</p>
                <div className="flex flex-wrap gap-4">
                  <Link to={`/pricing?service=${page.pricingService}`} className="text-red-400 hover:text-white underline underline-offset-4">View published pricing</Link>
                  <Link to="/prep-guide" className="text-red-400 hover:text-white underline underline-offset-4">Read the prep guide</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-6 md:px-12">
            <h2 className="font-playfair text-4xl md:text-5xl font-light mb-10">Frequently asked questions</h2>
            <div className="divide-y divide-white/10 border-y border-white/10">
              {page.faqs.map((faq) => (
                <section key={faq.question} className="py-7">
                  <h3 className="font-playfair text-2xl mb-3">{faq.question}</h3>
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="pb-12">
          <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
            <h2 className="font-playfair text-3xl font-light mb-6">Related photography services</h2>
            <nav aria-label="Related photography services" className="flex flex-wrap gap-x-6 gap-y-3">
              {SERVICE_AUTHORITY_LINKS.filter((link) => link.path !== page.path).map((link) => (
                <Link key={link.path} to={link.path} className="text-gray-300 hover:text-photo-red underline underline-offset-4">{link.label}</Link>
              ))}
              <Link to="/services" className="text-gray-300 hover:text-photo-red underline underline-offset-4">All services</Link>
              <Link to="/contact" className="text-gray-300 hover:text-photo-red underline underline-offset-4">Contact the studio</Link>
            </nav>
          </div>
        </section>

        <section className="pb-24" aria-labelledby="service-booking-cta">
          <div className="max-w-5xl mx-auto px-6 md:px-12">
            <div className="border border-white/15 bg-photo-gray-900 px-6 py-10 text-center sm:px-10 md:py-14">
              <h2 id="service-booking-cta" className="font-playfair text-3xl md:text-4xl font-light mb-4">Ready to plan your session?</h2>
              <p className="mx-auto max-w-2xl text-gray-300 leading-relaxed mb-7">Share your preferred date, location and creative goals. Jeff personally reviews each request before confirming availability.</p>
              <Link to={`/book?service=${page.pricingService}`} className="inline-flex items-center justify-center gap-2 bg-photo-red hover:bg-photo-red-hover px-7 py-4 text-sm font-medium uppercase tracking-[0.14em] transition-colors">
                Request availability <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      </article>
    </Layout>
  );
};

export default ServiceAuthority;
