import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, ExternalLink, Loader2 } from 'lucide-react';
import { apiUrl } from '@/lib/api-base';
import { fetchShopSettings } from '@/lib/shop';
import { formatUSD } from '@/components/shop/CartContext';
import NotFound from './NotFound';

interface ShopImage { id: number; image_url: string; thumbnail_url: string }
interface ShopVariant { id: number; name: string; value: string; price_adjust_cents: number }
export interface ShopProduct {
  id: number; name: string; slug: string; description: string | null;
  category: string; product_type: string; price_cents: number; compare_at_cents: number | null;
  inventory: number; featured: boolean;
  affiliate_url: string | null; affiliate_retailer: string | null;
  images: ShopImage[]; variants: ShopVariant[];
}

const CATEGORIES = ['All', 'Apparel', 'Prints', 'Books', 'Frames', 'Affiliate', 'Accessories'];

const Shop: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (cat: string, q: string) => {
    setLoading(true);
    try {
      const s = await fetchShopSettings();
      if (!s || !s.shop_enabled) { setEnabled(false); setLoading(false); return; }
      setEnabled(true);
      const params = new URLSearchParams();
      if (cat !== 'All') params.set('category', cat);
      if (q.trim()) params.set('q', q.trim());
      const res = await fetch(apiUrl(`/api/v1/shop/products?${params.toString()}`));
      if (res.status === 404) { setEnabled(false); return; }
      const data = await res.json();
      setProducts(data?.data?.products ?? []);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(category, query); }, [load, category]);
  useEffect(() => {
    const t = setTimeout(() => { if (enabled) void load(category, query); }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  if (enabled === false) return <NotFound />;

  const featured = products.filter((p) => p.featured).slice(0, 3);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Jeff Honforloco Photography</p>
          <h1 className="text-4xl font-bold sm:text-5xl">The Shop</h1>
          <p className="mx-auto mt-3 max-w-xl text-zinc-400">
            Prints, books, apparel &amp; frames from the studio — plus the gear Jeff actually uses.
          </p>
        </header>

        {featured.length > 0 && (
          <section className="mb-10 grid gap-4 sm:grid-cols-3" aria-label="Featured products">
            {featured.map((p) => <ProductCard key={p.id} product={p} featured />)}
          </section>
        )}

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categories">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${category === c ? 'bg-white text-black' : 'border border-white/15 text-zinc-300 hover:border-white/40'}`}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="relative block sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="w-full rounded-full border border-white/15 bg-white/5 py-2 pl-9 pr-4 text-sm placeholder:text-zinc-600 focus:border-white/40 focus:outline-none"
            />
          </label>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center py-24 text-center">
            <ShoppingBag className="mb-4 h-12 w-12 text-zinc-700" />
            <p className="text-zinc-400">No products found{query ? ` for “${query}”` : ''}.</p>
          </div>
        ) : (
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-label="Products">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </section>
        )}
      </div>
    </div>
  );
};

export const ProductCard: React.FC<{ product: ShopProduct; featured?: boolean }> = ({ product, featured }) => {
  const img = product.images[0];
  const thumb = img?.thumbnail_url || img?.image_url;
  const onSale = product.compare_at_cents != null && product.compare_at_cents > product.price_cents;
  const isAffiliate = product.product_type === 'affiliate';

  return (
    <Link
      to={`/shop/${product.slug}`}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-zinc-950 transition-transform hover:-translate-y-1"
    >
      <div className={`relative overflow-hidden bg-zinc-900 ${featured ? 'aspect-[4/3]' : 'aspect-square'}`}>
        {thumb ? (
          <img src={thumb} alt={product.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-700"><ShoppingBag className="h-10 w-10" /></div>
        )}
        {onSale && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide">Sale</span>
        )}
        {isAffiliate && (
          <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold backdrop-blur">
            <ExternalLink className="h-3 w-3" /> Affiliate
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">{product.category}</p>
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug">{product.name}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          {isAffiliate ? (
            <span className="text-sm font-semibold text-zinc-300">
              {product.affiliate_retailer ? `at ${product.affiliate_retailer}` : 'View deal'}
            </span>
          ) : (
            <>
              <span className="text-base font-bold">{formatUSD(product.price_cents)}</span>
              {onSale && <span className="text-sm text-zinc-500 line-through">{formatUSD(product.compare_at_cents!)}</span>}
            </>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Shop;
