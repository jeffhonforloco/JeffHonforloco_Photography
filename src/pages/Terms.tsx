import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const Terms = () => {
  return (
    <Layout>
      <main className="min-h-screen bg-photo-black text-white">
        <section className="pt-36 pb-24 md:pt-44 md:pb-32">
          <div className="max-w-4xl mx-auto px-8 md:px-16">
            <p className="font-inter text-xs tracking-[0.4em] text-photo-red-bright uppercase mb-4">
              Terms &amp; Conditions
            </p>
            <h1 className="font-playfair text-5xl md:text-6xl font-extralight tracking-wide mb-8 leading-tight">
              The fine print, kept simple
            </h1>
            <div className="w-20 h-px bg-gradient-to-r from-transparent via-photo-red to-transparent mb-12" />

            <div className="flex flex-col gap-10 font-inter font-light text-gray-300 leading-relaxed">
              <section>
                <h2 className="font-playfair text-2xl md:text-3xl font-light text-white mb-4">
                  Bookings &amp; payments
                </h2>
                <p>
                  Booking a session means choosing your package and paying your deposit (75%) or
                  the full amount up front through our secure checkout. Your requested shoot date
                  is held as a request until the studio confirms availability — payment confirms
                  your booking, not a specific time slot. The remaining balance, if any, is due on
                  the day of your shoot. Custom-priced packages are handled by invoice.
                </p>
              </section>

              <section>
                <h2 className="font-playfair text-2xl md:text-3xl font-light text-white mb-4">
                  Rescheduling &amp; cancellations
                </h2>
                <p>
                  Life happens. If you need to reschedule, contact the studio as early as
                  possible and your deposit moves to the new date. Deposits are non-refundable
                  within 72 hours of a confirmed shoot, because that time was reserved for you.
                </p>
              </section>

              <section>
                <h2 className="font-playfair text-2xl md:text-3xl font-light text-white mb-4">
                  Image use
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
                  Text messages (SMS)
                </h2>
                <p>
                  If you share your mobile number when booking or inquiring, Jeff Honforloco
                  Photography may send you text messages about your session: booking
                  confirmations, payment receipts, reminders, and schedule updates. Message
                  frequency varies — typically a few messages around your booking. Message and
                  data rates may apply.
                </p>
                <p className="mt-4">
                  You can opt out of text messages at any time by replying STOP. For help, reply
                  HELP or contact the studio directly:
                </p>
                <p className="mt-4">
                  Jeff Honforloco Photography, Providence, Rhode Island.{' '}
                  <a
                    href="mailto:info@jeffhonforlocophotos.com"
                    className="text-photo-red-bright hover:underline"
                  >
                    info@jeffhonforlocophotos.com
                  </a>{' '}
                  · +1 (646) 379-4237.
                </p>
              </section>

              <section>
                <h2 className="font-playfair text-2xl md:text-3xl font-light text-white mb-4">
                  Contact
                </h2>
                <p>
                  Questions about these terms? Reach the studio at{' '}
                  <a
                    href="mailto:info@jeffhonforlocophotos.com"
                    className="text-photo-red-bright hover:underline"
                  >
                    info@jeffhonforlocophotos.com
                  </a>{' '}
                  or +1 (646) 379-4237.
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

export default Terms;
