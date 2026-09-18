import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Loader2, Minus, Plus, ShoppingBag, Check } from 'lucide-react';
import { apiUrl } from '@/lib/api-base';
import { fetchShopSettings } from '@/lib/shop';
import { useCart, formatUSD } from '@/components/shop/CartContext';
import type { ShopProduct } from './Shop';
import NotFound from './NotFound';

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ShopProduct | null>(null);
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addLine } = useCart();

  const load = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const s = await fetchShopSettings();
      if (!s || !s.shop_enabled) { setEnabled(false); return; }
      setEnabled(true);
      const res = await fetch(apiUrl(`/api/v1/shop/products/${encodeURIComponent(slug)}`));
      if (res.status === 404) { setProduct(null); return; }
      const data = await res.json();
      setProduct(data?.data?.product ?? null);
    } catch {
      setProduct(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => { void load(); }, [load]);

  const variantGroups = useMemo(() => {
    const groups = new Map<string, ShopProduct['variants']>;
    for (const v of product?.variants ?? []) {
      if (!groups.has(v.name)) groups.set(v.name, []);
      groups.get(v.name)!.push(v);
    }
    return [...groups.entries()];
  }, [product]);

  const selectedVariant = product?.variants.find((v) => v.id === variantId) ?? null;
  const unitPrice = (product?.price_cents ?? 0) + (selectedVariant?.price_adjust_cents ?? 0);
  const isAffiliate = product?.product_type === 'affiliate';
  const soldOut = !isAffiliate && (product?.inventory ?? 0) <= 0 && (product?.variants.length ?? 0) === 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-zinc-500">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (enabled === false || !product) return <NotFound />;

  const doAdd = () => {
    if (isAffiliate || soldOut) return;
    if (variantGroups.length > 0 && !selectedVariant) return;
    const img = product.images[0];
    addLine({
      product_id: product.id,
      variant_id: selectedVariant?.id ?? null,
      name: product.name,
      variant_label: selectedVariant ? `${selectedVariant.name}: ${selectedVariant.value}` : null,
      price_cents: unitPrice,
      image_url: img?.thumbnail_url || img?.image_url || null,
      slug: product.slug,
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const onSale = product.compare_at_cents != null && product.compare_at_cents > product.price_cents;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <Link to="/shop" className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>

        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
              {product.images[activeImg] ? (
                <img
                  src={product.images[activeImg].image_url}
                  alt={product.name}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center text-zinc-700">
                  <ShoppingBag className="h-16 w-16" />
                </div>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setActiveImg(i)}
                    className={`overflow-hidden rounded-lg border-2 ${i === activeImg ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100'}`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img src={img.thumbnail_url} alt="" className="aspect-square w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">{product.category}</p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{product.name}</h1>

            <div className="mt-4 flex items-baseline gap-3">
              {isAffiliate ? (
                <span className="text-lg text-zinc-300">
                  {product.affiliate_retailer ? `Available at ${product.affiliate_retailer}` : 'External product'}
                </span>
              ) : (
                <>
                  <span className="text-3xl font-bold">{formatUSD(unitPrice)}</span>
                  {onSale && <span className="text-lg text-zinc-500 line-through">{formatUSD(product.compare_at_cents!)}</span>}
                  {onSale && <span className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold uppercase">Sale</span>}
                </>
              )}
            </div>

            {product.description && (
              <p className="mt-5 whitespace-pre-line text-zinc-300 leading-relaxed">{product.description}</p>
            )}

            {isAffiliate ? (
              <a
                href={product.affiliate_url ?? '#'}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-black hover:bg-zinc-200"
              >
                Buy on {product.affiliate_retailer || 'retailer site'} <ExternalLink className="h-4 w-4" />
              </a>
            ) : (
              <>
                {variantGroups.map(([name, variants]) => (
                  <div key={name} className="mt-6">
                    <p className="mb-2 text-sm font-medium text-zinc-300">{name}</p>
                    <div className="flex flex-wrap gap-2">
                      {variants.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => setVariantId(v.id)}
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${variantId === v.id ? 'border-white bg-white text-black' : 'border-white/20 text-zinc-200 hover:border-white/60'}`}
                        >
                          {v.value}
                          {v.price_adjust_cents !== 0 && (
                            <span className="ml-1 text-xs opacity-70">
                              ({v.price_adjust_cents > 0 ? '+' : ''}{formatUSD(v.price_adjust_cents)})
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="mt-8 flex items-center gap-3">
                  <div className="flex items-center gap-1 rounded-full border border-white/20 px-2 py-1.5">
                    <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-2 hover:text-zinc-300" aria-label="Decrease quantity">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-8 text-center font-semibold">{qty}</span>
                    <button onClick={() => setQty((q) => Math.min(99, q + 1))} className="p-2 hover:text-zinc-300" aria-label="Increase quantity">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={doAdd}
                    disabled={soldOut || (variantGroups.length > 0 && !selectedVariant)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-full bg-white py-3.5 text-sm font-bold text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {added ? <><Check className="h-4 w-4" /> Added to cart</> : soldOut ? 'Sold out' : <><ShoppingBag className="h-4 w-4" /> Add to cart — {formatUSD(unitPrice * qty)}</>}
                  </button>
                </div>
                {variantGroups.length > 0 && !selectedVariant && (
                  <p className="mt-2 text-xs text-amber-300">Please choose a {variantGroups[0][0].toLowerCase()} first.</p>
                )}
                {!soldOut && (product.inventory > 0 || (product.variants.length ?? 0) > 0) && (
                  <p className="mt-3 text-xs text-zinc-500">In stock — ships from the studio.</p>
                )}
              </>
            )}

            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">
              <p>Secure checkout via PayPal · Ships to US &amp; Canada · Questions? <Link to="/contact" className="text-white underline">Contact the studio</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
