import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CircleCheck, CircleX, Loader2, ShoppingBag } from 'lucide-react';
import { apiUrl } from '@/lib/api-base';

type CaptureState = 'capturing' | 'success' | 'failed' | 'no-token';

const ShopSuccess: React.FC = () => {
  const [params] = useSearchParams();
  // PayPal appends ?token=<orderId>&PayerID=<payerId> on return from approval.
  const token = params.get('token');
  const [state, setState] = useState<CaptureState>(
    token ? 'capturing' : 'no-token'
  );
  const [detail, setDetail] = useState('');
  const [orderRef, setOrderRef] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    (async () => {
      try {
        const res = await fetch(apiUrl('/api/v1/shop/capture'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paypal_order_id: token }),
        });
        const data = await res.json().catch(() => null);
        if (!alive) return;
        if (res.ok && data?.success) {
          setOrderRef(
            typeof data?.data?.capture_id === 'string'
              ? data.data.capture_id
              : `order-${data?.data?.order_id ?? token}`
          );
          setState('success');
        } else {
          setDetail(data?.error || 'Payment was not completed.');
          setState('failed');
        }
      } catch {
        if (alive) {
          setDetail('Could not confirm your payment — please contact the studio.');
          setState('failed');
        }
      }
    })();
    return () => { alive = false; };
  }, [token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="max-w-md text-center">
        {state === 'capturing' && (
          <>
            <Loader2 className="mx-auto mb-6 h-16 w-16 animate-spin text-zinc-400" />
            <h1 className="text-3xl font-bold">Confirming your payment…</h1>
            <p className="mt-3 text-zinc-400">One moment while we verify with PayPal.</p>
          </>
        )}

        {state === 'success' && (
          <>
            <CircleCheck className="mx-auto mb-6 h-16 w-16 text-emerald-400" />
            <h1 className="text-3xl font-bold">Thank you!</h1>
            <p className="mt-3 text-zinc-400">
              Your order is confirmed. A receipt was sent to your email, and the studio will
              reach out when your items ship.
            </p>
            {orderRef && (
              <p className="mt-4 break-all rounded-lg bg-white/5 px-3 py-2 text-xs text-zinc-500">
                Order ref: {orderRef}
              </p>
            )}
          </>
        )}

        {state === 'failed' && (
          <>
            <CircleX className="mx-auto mb-6 h-16 w-16 text-red-400" />
            <h1 className="text-3xl font-bold">Payment not completed</h1>
            <p className="mt-3 text-zinc-400">{detail || 'Something went wrong.'}</p>
            <p className="mt-2 text-sm text-zinc-500">No charge was made. You can try again or contact the studio.</p>
          </>
        )}

        {state === 'no-token' && (
          <>
            <ShoppingBag className="mx-auto mb-6 h-16 w-16 text-zinc-600" />
            <h1 className="text-3xl font-bold">No payment found</h1>
            <p className="mt-3 text-zinc-400">
              This page is reached after completing a PayPal checkout.
            </p>
          </>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/shop" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black hover:bg-zinc-200">
            <ShoppingBag className="h-4 w-4" /> {state === 'failed' ? 'Try again' : 'Keep shopping'}
          </Link>
          <Link to="/" className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold hover:border-white/50">
            Back home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ShopSuccess;
