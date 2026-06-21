import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import HighResImage from '../components/common/HighResImage';

const portfolioCategories = [
  {
    title: 'Fashion',
    slug: 'fashion',
    image: '/images/9cac59de-27c1-4b0a-8c2b-1d8333486e54.png',
    href: '/portfolios/fashion',
  },
  {
    title: 'Glamour',
    slug: 'glamour',
    image: '/images/7c6c25d5-48ef-4f79-8369-b5edab7ddc85.png',
    href: '/portfolios/glamour',
  },
  {
    title: 'Beauty',
    slug: 'beauty',
    image: '/images/08c64276-3665-4346-a637-ca41acc6c602.png',
    href: '/portfolios/beauty',
  },
  {
    title: 'Editorial',
    slug: 'editorial',
    image: '/images/67b5c2bf-d1a3-44e4-af56-212f23e37262.png',
    href: '/portfolios/editorial',
  },
  {
    title: 'Headshots',
    slug: 'headshots',
    image: '/images/headshot-client-2.jpeg',
    href: '/portfolios/headshots',
  },
  {
    title: 'Lifestyle',
    slug: 'lifestyle',
    image: '/images/bcd80ca3-d60c-4596-9a71-4b8602583ff7.png',
    href: '/portfolios/lifestyle',
  },
  {
    title: 'Motion',
    slug: 'motion',
    image: '/images/IMG_7655.jpeg',
    href: '/portfolios/motion',
  },
];

const Portfolio = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-black">
        {/* Single responsive grid — no duplicate mobile/desktop DOM */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 min-h-screen">
          {portfolioCategories.map((category, index) => (
            <Link
              key={category.slug}
              to={category.href}
              className="relative group overflow-hidden"
            >
              <HighResImage
                src={category.image}
                alt={`${category.title} Photography by Jeff Honforloco`}
                className="w-full h-full"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 14vw"
                priority={index < 2}
                quality={80}
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/15 transition-colors duration-300" />
              <div className="absolute inset-0 flex items-center justify-center">
                <h2 className="text-white text-lg lg:text-3xl xl:text-4xl font-bold tracking-wider uppercase text-center px-2">
                  {category.title}
                </h2>
              </div>
            </Link>
          ))}
        </div>

        <div className="fixed bottom-4 left-0 right-0 text-center z-10 pointer-events-none">
          <p className="text-white/60 text-sm tracking-wide bg-black/80 backdrop-blur inline-block px-4 py-2 rounded">
            &copy; 2026 Jeff Honforloco Photography. All rights reserved.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Portfolio;
