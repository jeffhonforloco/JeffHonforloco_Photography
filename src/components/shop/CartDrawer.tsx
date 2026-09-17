import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart, formatUSD } from './CartContext';
import { apiUrl } from '@/lib/api-base';

const CartDrawer: React.FC = () => {
  const { lines, subtotal_cents, isOpen, closeCart, updateQty, removeLine, clear } = useCart();
  const [email, setEmail] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const checkout = async () => {
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError('Enter a valid email for your receipt.');
      return;
    }
    setCheckingOut(true);
    try {
      const res = await fetch(apiUrl('/api/v1/shop/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          items: lines.map((l) => ({ product_id: l.product_id, variant_id: l.variant_id, quantity: l.quantity })),
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Checkout failed');
      if (data?.needsPayPal) throw new Error('Online checkout is not connected yet — please contact the studio directly.');
      if (data?.data?.url) {
        clear();
        window.location.href = data.data.url as string;
        return;
      }
      throw new Error('Checkout failed — no redirect URL');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <button className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeCart} aria-label="Close cart" />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-zinc-950 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <ShoppingBag className="h-5 w-5" /> Your Cart
            <span className="text-sm font-normal text-zinc-400">({lines.reduce((s, l) => s + l.quantity, 0)})</span>
          </h2>
          <button onClick={closeCart} className="rounded-full p-2 hover:bg-white/10" aria-label="Close cart">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="mb-4 h-12 w-12 text-zinc-600" />
              <p className="text-zinc-400">Your cart is empty.</p>
              <Link to="/shop" onClick={closeCart} className="mt-4 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black hover:bg-zinc-200">
                Browse the shop
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {lines.map((l) => (
                <li key={`${l.product_id}:${l.variant_id ?? 0}`} className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <Link to={`/shop/${l.slug}`} onClick={closeCart} className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-900">
                    {l.image_url ? (
                      <img src={l.image_url} alt={l.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-zinc-600"><ShoppingBag className="h-6 w-6" /></div>
                    )}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    {l.variant_label && <p className="text-xs text-zinc-400">{l.variant_label}</p>}
                    <p className="mt-1 text-sm font-semibold">{formatUSD(l.price_cents)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-1 rounded-full border border-white/15 px-1 py-0.5">
                        <button onClick={() => updateQty(l.product_id, l.variant_id, l.quantity - 1)} className="p-1.5 hover:text-zinc-300" aria-label="Decrease quantity">
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-6 text-center text-sm">{l.quantity}</span>
                        <button onClick={() => updateQty(l.product_id, l.variant_id, l.quantity + 1)} className="p-1.5 hover:text-zinc-300" aria-label="Increase quantity">
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button onClick={() => removeLine(l.product_id, l.variant_id)} className="p-1.5 text-zinc-500 hover:text-red-400" aria-label="Remove item">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-white/10 px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-zinc-400">Subtotal</span>
              <span className="text-lg font-semibold">{formatUSD(subtotal_cents)}</span>
            </div>
            <p className="mb-3 text-xs text-zinc-500">Shipping &amp; tax calculated at checkout.</p>
            <label className="mb-3 block">
              <span className="mb-1 block text-xs font-medium text-zinc-400">Email for receipt</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-white/40 focus:outline-none"
              />
            </label>
            {error && <p className="mb-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => checkout()}
                disabled={checkingOut}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-white py-3 text-sm font-bold text-black hover:bg-zinc-200 disabled:opacity-60"
              >
                {checkingOut && <Loader2 className="h-4 w-4 animate-spin" />}
                {checkingOut ? 'Connecting to PayPal…' : 'Pay with PayPal'}
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-zinc-600">Secured by PayPal — your payment details never touch our servers.</p>
          </div>
        )}
      </aside>
    </div>
  );
};

export default CartDrawer;
