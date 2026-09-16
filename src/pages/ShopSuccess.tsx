import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ShoppingBag } from 'lucide-react';

const ShopSuccess: React.FC = () => {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 text-white">
      <div className="max-w-md text-center">
        <CheckCircle2 className="mx-auto mb-6 h-16 w-16 text-emerald-400" />
        <h1 className="text-3xl font-bold">Thank you!</h1>
        <p className="mt-3 text-zinc-400">
          Your order is confirmed. A receipt was sent to your email, and the studio will
          reach out when your items ship.
        </p>
        {sessionId && (
          <p className="mt-4 break-all rounded-lg bg-white/5 px-3 py-2 text-xs text-zinc-500">
            Order ref: {sessionId.slice(0, 32)}…
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/shop" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black hover:bg-zinc-200">
            <ShoppingBag className="h-4 w-4" /> Keep shopping
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
