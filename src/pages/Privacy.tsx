import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <Layout>
      <main className="min-h-screen bg-photo-black text-white">
        <section className="pt-36 pb-24 md:pt-44 md:pb-32">
          <div className="max-w-4xl mx-auto px-8 md:px-16">
            <p className="font-inter text-xs tracking-[0.4em] text-photo-red-bright uppercase mb-4">
              Privacy Policy
            </p>
            <h1 className="font-playfair text-5xl md:text-6xl font-extralight tracking-wide mb-8 leading-tight">
              How your information is handled
            </h1>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-photo-red to-transparent mb-12" />

            <div className="flex flex-col gap-10 font-inter font-light text-gray-300 leading-relaxed">
              <section>
                <h2 className="font-playfair text-2xl md:text-3xl font-light text-white mb-4">
                  Information you share
                </h2>
                <p>
                  When you send an inquiry, request a booking, or sign up for updates, you share
                  details such as your name, email address, phone number, preferred date, and
                  project information. This information is used only to respond to you, plan your
                  session, and run the studio — it is never sold.
                </p>
              </section>

              <section>
                <h2 className="font-playfair text-2xl md:text-3xl font-light text-white mb-4">
                  Analytics
                </h2>
                <p>
                  This site uses Google Analytics to understand which pages visitors find useful.
                  Analytics collects aggregated, anonymized information such as pages viewed, device
                  type, and approximate location. You can opt out of Google Analytics with the
                  Google Analytics opt-out browser add-on.
                </p>
              </section>

              <section>
                <h2 className="font-playfair text-2xl md:text-3xl font-light text-white mb-4">
                  Cookies
                </h2>
                <p>
                  The site uses a small number of cookies for core functionality and analytics
                  measurement. No advertising or cross-site tracking cookies are used.
                </p>
              </section>

              <section>
                <h2 className="font-playfair text-2xl md:text-3xl font-light text-white mb-4">
                  Your photographs
                </h2>
                <p>
                  Portfolio images on this site are published with client permission. If you are a
                  client and would like an image of you removed from the public portfolio, email{' '}
                  <a
                    href="mailto:info@jeffhonforlocophotos.com"
                    className="text-photo-red-bright hover:underline"
                  >
                    info@jeffhonforlocophotos.com
                  </a>{' '}
                  and it will be taken down.
                </p>
              </section>

              <section>
                <h2 className="font-playfair text-2xl md:text-3xl font-light text-white mb-4">
                  Your rights
                </h2>
                <p>
                  You can ask what personal information is held about you, ask for it to be
                  corrected, or ask for it to be deleted at any time by emailing{' '}
                  <a
                    href="mailto:info@jeffhonforlocophotos.com"
                    className="text-photo-red-bright hover:underline"
                  >
                    info@jeffhonforlocophotos.com
                  </a>
                  .
                </p>
              </section>

              <section>
                <h2 className="font-playfair text-2xl md:text-3xl font-light text-white mb-4">
                  Contact
                </h2>
                <p>
                  Jeff Honforloco Photography, Providence, Rhode Island.{' '}
                  <a
                    href="mailto:info@jeffhonforlocophotos.com"
                    className="text-photo-red-bright hover:underline"
                  >
                    info@jeffhonforlocophotos.com
                  </a>{' '}
                  · +1 (646) 379-4237.
                </p>
                <p className="mt-6">
                  <Link to="/book" className="text-photo-red-bright hover:underline">
                    Ready to book your shoot? →
                  </Link>
                </p>
              </section>

              <p className="text-sm text-gray-500">Effective: September 2026.</p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
};

export default Privacy;
