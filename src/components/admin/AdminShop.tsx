import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ShoppingBag, Plus, Search, Pencil, Trash2, X, Loader2, Package,
  Truck, ExternalLink, ImagePlus, GripVertical, Power, AlertTriangle,
  CheckCircle2, DollarSign, Store,
} from 'lucide-react';
import { apiUrl } from '@/lib/api-base';
import { optimizeImageForUpload } from '@/lib/image-optimize';
import { clearShopSettingsCache } from '@/lib/shop';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const authHeaders = () => {
  const token = localStorage.getItem('adminToken');
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
};

const CATEGORIES = ['Apparel', 'Prints', 'Books', 'Frames', 'Affiliate', 'Accessories'];

interface ProductImage { image_url: string; thumbnail_url: string }
interface ProductVariant { id?: number; name: string; value: string; price_adjust_cents: number; sku: string; inventory: number | null }
interface Product {
  id: number; name: string; slug: string; description: string | null; category: string;
  product_type: 'physical' | 'affiliate'; price_cents: number; compare_at_cents: number | null;
  sku: string | null; inventory: number; weight_oz: number; featured: boolean; active: boolean;
  affiliate_url: string | null; affiliate_retailer: string | null;
  images: ProductImage[]; variants: ProductVariant[];
}
interface OrderItem { id: number; name: string; variant_label: string | null; quantity: number; unit_price_cents: number; total_cents: number }
interface Order {
  id: number; email: string; customer_name: string | null; shipping_json: string | null;
  subtotal_cents: number; shipping_cents: number; tax_cents: number; total_cents: number;
  status: string; fulfillment_status: string; tracking_number: string | null; notes: string | null;
  created_at: string; items: OrderItem[];
}

const fmt = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const dollarsToCents = (s: string) => Math.round((parseFloat(s) || 0) * 100);

const emptyForm = {
  name: '', description: '', category: 'Prints', product_type: 'physical' as 'physical' | 'affiliate',
  price: '', compare_at: '', sku: '', inventory: '0', weight_oz: '0',
  featured: false, active: true, affiliate_url: '', affiliate_retailer: '',
  images: [] as ProductImage[], variants: [] as ProductVariant[],
};

const AdminShop: React.FC = () => {
  const [tab, setTab] = useState<'products' | 'orders' | 'settings'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderStats, setOrderStats] = useState({ paid_revenue_cents: 0, paid_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [orderFilter, setOrderFilter] = useState('');

  /* ---------- settings (incl. the ON/OFF toggle) ---------- */
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [stripeInfo, setStripeInfo] = useState<any>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const shopEnabled = settings.shop_enabled === '1';

  const loadProducts = useCallback(async () => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('q', search.trim());
    if (catFilter !== 'All') params.set('category', catFilter);
    const res = await fetch(apiUrl(`/api/v1/admin/shop/products?${params}`), { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load products');
    setProducts(data.data.products);
  }, [search, catFilter]);

  const loadOrders = useCallback(async () => {
    const params = new URLSearchParams();
    if (orderFilter) params.set('status', orderFilter);
    const res = await fetch(apiUrl(`/api/v1/admin/shop/orders?${params}`), { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load orders');
    setOrders(data.data.orders);
    setOrderStats(data.data.stats);
  }, [orderFilter]);

  const loadSettings = useCallback(async () => {
    const res = await fetch(apiUrl('/api/v1/admin/shop/settings'), { headers: authHeaders() });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load settings');
    setSettings(data.data.settings);
    setStripeInfo(data.data.stripe);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try { await Promise.all([loadProducts(), loadOrders(), loadSettings()]); }
    catch (e) { setError(e instanceof Error ? e.message : 'Load failed'); }
    finally { setLoading(false); }
  }, [loadProducts, loadOrders, loadSettings]);

  useEffect(() => { void reload(); }, [reload]);

  const saveSettings = async (patch: Record<string, string>) => {
    setSettingsSaving(true); setError(null);
    try {
      const res = await fetch(apiUrl('/api/v1/admin/shop/settings'), {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSettings(data.data.settings);
      clearShopSettingsCache();
    } catch (e) { setError(e instanceof Error ? e.message : 'Save failed'); }
    finally { setSettingsSaving(false); }
  };

  const toggleShop = () => saveSettings({ shop_enabled: shopEnabled ? '0' : '1' });

  /* ---------- product editor ---------- */
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const openCreate = () => { setForm({ ...emptyForm, images: [], variants: [] }); setCreating(true); setEditing(null); setFormError(null); };
  const openEdit = (p: Product) => {
    setForm({
      name: p.name, description: p.description ?? '', category: p.category, product_type: p.product_type,
      price: (p.price_cents / 100).toFixed(2), compare_at: p.compare_at_cents != null ? (p.compare_at_cents / 100).toFixed(2) : '',
      sku: p.sku ?? '', inventory: String(p.inventory), weight_oz: String(p.weight_oz),
      featured: p.featured, active: p.active,
      affiliate_url: p.affiliate_url ?? '', affiliate_retailer: p.affiliate_retailer ?? '',
      images: p.images.map((i) => ({ ...i })), variants: p.variants.map((v) => ({ ...v })),
    });
    setEditing(p); setCreating(false); setFormError(null);
  };
  const closeEditor = () => { setCreating(false); setEditing(null); };

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true); setFormError(null);
    try {
      const token = localStorage.getItem('adminToken');
      const uploaded: ProductImage[] = [];
      for (const file of Array.from(files).slice(0, 10 - form.images.length)) {
        const { full, thumb } = await optimizeImageForUpload(file);
        const fd = new FormData();
        fd.append('image', full.blob, full.name);
        fd.append('thumbnail', thumb.blob, thumb.name);
        const res = await fetch(apiUrl('/api/v1/admin/media/upload'), {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: fd,
        });
        const data = await res.json();
        if (res.ok && data.success) {
          uploaded.push({ image_url: data.data.url, thumbnail_url: data.data.thumbnail_url || data.data.url });
        } else {
          throw new Error(data.error || 'Upload failed');
        }
      }
      setForm((f) => ({ ...f, images: [...f.images, ...uploaded] }));
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Image upload failed');
    } finally { setUploading(false); }
  };

  const moveImage = (i: number, dir: -1 | 1) => {
    setForm((f) => {
      const imgs = [...f.images];
      const j = i + dir;
      if (j < 0 || j >= imgs.length) return f;
      [imgs[i], imgs[j]] = [imgs[j], imgs[i]];
      return { ...f, images: imgs };
    });
  };

  const addVariant = () => setForm((f) => ({
    ...f, variants: [...f.variants, { name: f.variants[0]?.name || 'Size', value: '', price_adjust_cents: 0, sku: '', inventory: null }],
  }));
  const updateVariant = (i: number, patch: Partial<ProductVariant>) => setForm((f) => ({
    ...f, variants: f.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)),
  }));
  const removeVariant = (i: number) => setForm((f) => ({ ...f, variants: f.variants.filter((_, j) => j !== i) }));

  const saveProduct = async () => {
    setFormError(null);
    if (!form.name.trim()) { setFormError('Name is required'); return; }
    if (form.product_type === 'affiliate' && !form.affiliate_url.trim()) { setFormError('Affiliate products need an external URL'); return; }
    setFormSaving(true);
    try {
      const payload = {
        name: form.name.trim(), description: form.description.trim(), category: form.category,
        product_type: form.product_type,
        price_cents: dollarsToCents(form.price),
        compare_at_cents: form.compare_at.trim() ? dollarsToCents(form.compare_at) : null,
        sku: form.sku.trim(), inventory: parseInt(form.inventory, 10) || 0,
        weight_oz: parseFloat(form.weight_oz) || 0,
        featured: form.featured, active: form.active,
        affiliate_url: form.affiliate_url.trim(), affiliate_retailer: form.affiliate_retailer.trim(),
        images: form.images, variants: form.variants.filter((v) => v.value.trim()),
      };
      const url = editing ? apiUrl(`/api/v1/admin/shop/products/${editing.id}`) : apiUrl('/api/v1/admin/shop/products');
      const res = await fetch(url, { method: editing ? 'PUT' : 'POST', headers: authHeaders(), body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      closeEditor();
      await loadProducts();
    } catch (e) { setFormError(e instanceof Error ? e.message : 'Save failed'); }
    finally { setFormSaving(false); }
  };

  const deleteProduct = async (p: Product) => {
    if (!confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    const res = await fetch(apiUrl(`/api/v1/admin/shop/products/${p.id}`), { method: 'DELETE', headers: authHeaders() });
    if (!res.ok) { const d = await res.json(); setError(d.error || 'Delete failed'); return; }
    await loadProducts();
  };

  /* ---------- orders ---------- */
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderSaving, setOrderSaving] = useState(false);

  const updateOrder = async (id: number, patch: Record<string, string>) => {
    setOrderSaving(true);
    try {
      const res = await fetch(apiUrl(`/api/v1/admin/shop/orders/${id}`), {
        method: 'PATCH', headers: authHeaders(), body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setSelectedOrder((o) => (o && o.id === id ? { ...o, ...data.data.order } : o));
      await loadOrders();
    } catch (e) { setError(e instanceof Error ? e.message : 'Update failed'); }
    finally { setOrderSaving(false); }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      paid: 'bg-emerald-600', pending: 'bg-amber-600', refunded: 'bg-slate-600', cancelled: 'bg-red-600',
      unfulfilled: 'bg-amber-600', fulfilled: 'bg-blue-600', shipped: 'bg-emerald-600', delivered: 'bg-slate-600',
    };
    return <Badge className={`${map[s] ?? 'bg-slate-600'} text-white`}>{s}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><ShoppingBag className="h-6 w-6" /> Shop</h1>
          <p className="text-sm text-slate-500">Products, orders &amp; store settings</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${shopEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
            <span className={`h-2 w-2 rounded-full ${shopEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            {shopEnabled ? 'Shop is LIVE' : 'Shop is OFF'}
          </span>
          <Button onClick={() => setTab('products')} variant={tab === 'products' ? 'default' : 'outline'} size="sm">Products</Button>
          <Button onClick={() => setTab('orders')} variant={tab === 'orders' ? 'default' : 'outline'} size="sm">
            Orders {orders.filter((o) => o.status === 'paid' && o.fulfillment_status === 'unfulfilled').length > 0 && (
              <Badge className="ml-1 bg-red-600 text-white">{orders.filter((o) => o.status === 'paid' && o.fulfillment_status === 'unfulfilled').length}</Badge>
            )}
          </Button>
          <Button onClick={() => setTab('settings')} variant={tab === 'settings' ? 'default' : 'outline'} size="sm">Settings</Button>
        </div>
      </div>

      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-slate-400"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <>
          {tab === 'products' && (
            <section className="space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
                      className="w-56 rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-slate-500 focus:outline-none" />
                  </div>
                  <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                    <option>All</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <Button onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> Add product</Button>
              </div>

              {products.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
                  <Package className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                  <p>No products yet. Add your first t-shirt, print, book or affiliate pick.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((p) => (
                    <div key={p.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                      <div className="relative aspect-square bg-slate-100">
                        {p.images[0] ? (
                          <img src={p.images[0].thumbnail_url} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-300"><ShoppingBag className="h-10 w-10" /></div>
                        )}
                        <div className="absolute left-2 top-2 flex gap-1">
                          {!p.active && <Badge className="bg-slate-700 text-white">Hidden</Badge>}
                          {p.featured && <Badge className="bg-amber-500 text-white">Featured</Badge>}
                          {p.product_type === 'affiliate' && <Badge className="bg-blue-600 text-white">Affiliate</Badge>}
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">{p.category}</p>
                        <p className="truncate text-sm font-semibold">{p.name}</p>
                        <p className="mt-1 text-sm font-bold">
                          {p.product_type === 'affiliate' ? <span className="text-xs font-medium text-slate-500">{p.affiliate_retailer || 'External'}</span> : fmt(p.price_cents)}
                          {p.product_type === 'physical' && <span className="ml-2 text-xs font-normal text-slate-400">Stock: {p.inventory}</span>}
                        </p>
                        <div className="mt-2 flex gap-1">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(p)}><Pencil className="mr-1 h-3.5 w-3.5" /> Edit</Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => deleteProduct(p)} aria-label={`Delete ${p.name}`}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === 'orders' && (
            <section className="space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="flex items-center gap-1 text-xs text-slate-500"><DollarSign className="h-3.5 w-3.5" /> Paid revenue</p>
                  <p className="mt-1 text-xl font-bold">{fmt(orderStats.paid_revenue_cents)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Paid orders</p>
                  <p className="mt-1 text-xl font-bold">{orderStats.paid_count}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Needs fulfillment</p>
                  <p className="mt-1 text-xl font-bold">{orders.filter((o) => o.status === 'paid' && o.fulfillment_status === 'unfulfilled').length}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-xs text-slate-500">Filter</p>
                  <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm">
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option><option value="paid">Paid</option>
                    <option value="refunded">Refunded</option><option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 py-16 text-center text-slate-500">
                  <Truck className="mx-auto mb-3 h-10 w-10 text-slate-300" /><p>No orders yet.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Fulfillment</th><th className="px-4 py-3">Date</th></tr>
                    </thead>
                    <tbody>
                      {orders.map((o) => (
                        <tr key={o.id} className="cursor-pointer border-t border-slate-100 hover:bg-slate-50" onClick={() => setSelectedOrder(o)}>
                          <td className="px-4 py-3 font-semibold">#{o.id}</td>
                          <td className="px-4 py-3"><div className="truncate max-w-48">{o.customer_name || '—'}</div><div className="truncate max-w-48 text-xs text-slate-400">{o.email}</div></td>
                          <td className="px-4 py-3 font-semibold">{fmt(o.total_cents)}</td>
                          <td className="px-4 py-3">{statusBadge(o.status)}</td>
                          <td className="px-4 py-3">{statusBadge(o.fulfillment_status)}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{new Date(o.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {tab === 'settings' && (
            <section className="mx-auto max-w-2xl space-y-4">
              {/* SHOP ON/OFF — the master switch */}
              <div className={`rounded-xl border-2 p-5 ${shopEnabled ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 bg-slate-50'}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900"><Power className="h-5 w-5" /> Shop visibility</h2>
                    <p className="mt-1 text-sm text-slate-600">
                      {shopEnabled
                        ? 'The shop is LIVE — /shop is public and the nav link shows.'
                        : 'The shop is OFF — /shop returns 404 and the nav link is hidden. Turn it on when you’re ready to launch.'}
                    </p>
                  </div>
                  <button
                    onClick={toggleShop}
                    disabled={settingsSaving}
                    role="switch"
                    aria-checked={shopEnabled}
                    aria-label="Toggle shop live"
                    className={`relative h-10 shrink-0 rounded-full transition-colors ${shopEnabled ? 'bg-emerald-500' : 'bg-slate-300'} ${settingsSaving ? 'opacity-60' : ''}`}
                    style={{ width: 72 }}
                  >
                    <span className={`absolute top-1 h-8 w-8 rounded-full bg-white shadow transition-all ${shopEnabled ? 'left-[38px]' : 'left-1'}`} />
                  </button>
                </div>
                {!shopEnabled && (
                  <p className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    While OFF, product pages, the cart and checkout are all unreachable — safe to build your catalog first.
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold"><Store className="h-5 w-5" /> Store details</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="block sm:col-span-2">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Store name</span>
                    <input value={settings.store_name ?? ''} onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Flat shipping ($) — e.g. 7.95</span>
                    <input value={((parseInt(settings.flat_shipping_cents ?? '795', 10) || 0) / 100).toFixed(2)}
                      onChange={(e) => setSettings({ ...settings, flat_shipping_cents: String(dollarsToCents(e.target.value)) })}
                      inputMode="decimal" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Free shipping over ($) — e.g. 150</span>
                    <input value={((parseInt(settings.free_shipping_over_cents ?? '15000', 10) || 0) / 100).toFixed(2)}
                      onChange={(e) => setSettings({ ...settings, free_shipping_over_cents: String(dollarsToCents(e.target.value)) })}
                      inputMode="decimal" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Tax rate (%) — 0 if unsure</span>
                    <input value={settings.tax_rate_percent ?? '0'} onChange={(e) => setSettings({ ...settings, tax_rate_percent: e.target.value })}
                      inputMode="decimal" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Store email</span>
                    <input value={settings.store_email ?? ''} onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </label>
                </div>
                <Button className="mt-4" onClick={() => saveSettings(settings)} disabled={settingsSaving}>
                  {settingsSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />} Save settings
                </Button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <h2 className="text-lg font-bold">Stripe payments</h2>
                {stripeInfo ? (
                  <ul className="mt-3 space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      {stripeInfo.secret_configured ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                      Secret key {stripeInfo.secret_configured ? 'connected' : 'missing — add STRIPE_SECRET_KEY to worker secrets'}
                    </li>
                    <li className="flex items-center gap-2">
                      {stripeInfo.webhook_secret_configured ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                      Webhook secret {stripeInfo.webhook_secret_configured ? 'connected' : 'missing — add STRIPE_WEBHOOK_SECRET to worker secrets'}
                    </li>
                    <li className="text-xs text-slate-500">Register this webhook URL in Stripe → Developers → Webhooks:<br />
                      <code className="rounded bg-slate-100 px-1.5 py-0.5">https://&lt;worker-host&gt;/api/v1/webhooks/stripe</code>
                    </li>
                  </ul>
                ) : <p className="mt-2 text-sm text-slate-500">Loading…</p>}
              </div>
            </section>
          )}
        </>
      )}

      {/* ---------- product editor modal ---------- */}
      {(creating || editing) && (
        <div className="fixed inset-0 z-[80] overflow-y-auto" role="dialog" aria-modal="true" aria-label={editing ? 'Edit product' : 'New product'}>
          <div className="fixed inset-0 bg-slate-950/60" onClick={closeEditor} />
          <div className="relative mx-auto my-8 w-[calc(100%-2rem)] max-w-3xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editing ? `Edit: ${editing.name}` : 'New product'}</h2>
              <button onClick={closeEditor} className="rounded-full p-2 hover:bg-slate-100" aria-label="Close editor"><X className="h-5 w-5" /></button>
            </div>
            {formError && <div className="mb-4 rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700">{formError}</div>}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-slate-500">Name *</span>
                <input value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="Golden Hour Print — 16×20" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Type</span>
                <select value={form.product_type} onChange={(e) => set('product_type', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="physical">Physical — sold &amp; shipped</option>
                  <option value="affiliate">Affiliate — external buy link</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Category</span>
                <select value={form.category} onChange={(e) => set('category', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-medium text-slate-500">Description</span>
                <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </label>

              {form.product_type === 'physical' ? (
                <>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Price ($) *</span>
                    <input value={form.price} onChange={(e) => set('price', e.target.value)} inputMode="decimal" placeholder="49.00" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Compare-at price ($) — for sales</span>
                    <input value={form.compare_at} onChange={(e) => set('compare_at', e.target.value)} inputMode="decimal" placeholder="69.00" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">SKU</span>
                    <input value={form.sku} onChange={(e) => set('sku', e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Inventory count</span>
                    <input value={form.inventory} onChange={(e) => set('inventory', e.target.value)} inputMode="numeric" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Weight (oz) — for shipping</span>
                    <input value={form.weight_oz} onChange={(e) => set('weight_oz', e.target.value)} inputMode="decimal" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="h-4 w-4" /> Featured</label>
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="h-4 w-4" /> Active (visible)</label>
                  </div>
                </>
              ) : (
                <>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">External buy URL *</span>
                    <input value={form.affiliate_url} onChange={(e) => set('affiliate_url', e.target.value)} placeholder="https://…" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-500">Retailer name</span>
                    <input value={form.affiliate_retailer} onChange={(e) => set('affiliate_retailer', e.target.value)} placeholder="Amazon, B&H…" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                  </label>
                  <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} className="h-4 w-4" /> Active (visible)</label>
                </>
              )}

              {/* images */}
              <div className="sm:col-span-2">
                <span className="mb-2 block text-xs font-medium text-slate-500">Images (auto-converted to WebP)</span>
                <div className="flex flex-wrap gap-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative h-20 w-20 overflow-hidden rounded-lg border border-slate-200">
                      <img src={img.thumbnail_url} alt="" className="h-full w-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/50 py-0.5">
                        <button onClick={() => moveImage(i, -1)} className="px-1 text-white" aria-label="Move left">‹</button>
                        <button onClick={() => moveImage(i, 1)} className="px-1 text-white" aria-label="Move right">›</button>
                        <button onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))} className="px-1 text-red-300" aria-label="Remove image"><X className="h-3 w-3" /></button>
                      </div>
                      {i === 0 && <span className="absolute left-1 top-1 rounded bg-black/60 px-1 text-[10px] text-white">main</span>}
                    </div>
                  ))}
                  <button onClick={() => fileRef.current?.click()} disabled={uploading || form.images.length >= 10}
                    className="flex h-20 w-20 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-slate-500 hover:text-slate-600 disabled:opacity-50">
                    {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
                    <span className="mt-1 text-[10px]">Add</span>
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { void handleImageUpload(e.target.files); e.target.value = ''; }} />
              </div>

              {/* variants */}
              {form.product_type === 'physical' && (
                <div className="sm:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">Variants (e.g. Size: S/M/L, or Print size: 8×10)</span>
                    <Button size="sm" variant="outline" onClick={addVariant}><Plus className="mr-1 h-3.5 w-3.5" /> Add variant</Button>
                  </div>
                  {form.variants.length === 0 && <p className="text-xs text-slate-400">No variants — the product sells as-is.</p>}
                  <div className="space-y-2">
                    {form.variants.map((v, i) => (
                      <div key={i} className="flex items-center gap-2 rounded-lg border border-slate-200 p-2">
                        <GripVertical className="h-4 w-4 text-slate-300" />
                        <input value={v.name} onChange={(e) => updateVariant(i, { name: e.target.value })} placeholder="Size" className="w-20 rounded border border-slate-200 px-2 py-1.5 text-xs" />
                        <input value={v.value} onChange={(e) => updateVariant(i, { value: e.target.value })} placeholder="L" className="w-20 rounded border border-slate-200 px-2 py-1.5 text-xs" />
                        <input value={v.price_adjust_cents === 0 ? '' : (v.price_adjust_cents / 100).toFixed(2)} onChange={(e) => updateVariant(i, { price_adjust_cents: dollarsToCents(e.target.value) })} placeholder="+$" inputMode="decimal" className="w-20 rounded border border-slate-200 px-2 py-1.5 text-xs" title="Price adjustment in dollars (+/-)" />
                        <input value={v.inventory == null ? '' : String(v.inventory)} onChange={(e) => updateVariant(i, { inventory: e.target.value === '' ? null : parseInt(e.target.value, 10) || 0 })} placeholder="Stock" inputMode="numeric" className="w-16 rounded border border-slate-200 px-2 py-1.5 text-xs" title="Variant stock (blank = use product stock)" />
                        <button onClick={() => removeVariant(i)} className="p-1 text-red-500 hover:text-red-700" aria-label="Remove variant"><X className="h-4 w-4" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={closeEditor}>Cancel</Button>
              <Button onClick={saveProduct} disabled={formSaving}>
                {formSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing ? 'Save changes' : 'Create product'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- order detail modal ---------- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[80] overflow-y-auto" role="dialog" aria-modal="true" aria-label={`Order ${selectedOrder.id}`}>
          <div className="fixed inset-0 bg-slate-950/60" onClick={() => setSelectedOrder(null)} />
          <div className="relative mx-auto my-8 w-[calc(100%-2rem)] max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">Order #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} className="rounded-full p-2 hover:bg-slate-100" aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="mb-4 flex flex-wrap gap-2">{statusBadge(selectedOrder.status)}{statusBadge(selectedOrder.fulfillment_status)}</div>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div><p className="text-xs text-slate-500">Customer</p><p className="font-medium">{selectedOrder.customer_name || '—'}</p><p className="text-slate-500">{selectedOrder.email}</p></div>
              <div><p className="text-xs text-slate-500">Placed</p><p>{new Date(selectedOrder.created_at).toLocaleString()}</p></div>
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 p-3">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Items</p>
              <ul className="space-y-1.5 text-sm">
                {selectedOrder.items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-2">
                    <span>{it.quantity}× {it.name}{it.variant_label && <span className="text-slate-500"> ({it.variant_label})</span>}</span>
                    <span className="font-medium">{fmt(it.total_cents)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 space-y-1 border-t border-slate-200 pt-2 text-sm">
                <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{fmt(selectedOrder.subtotal_cents)}</span></div>
                <div className="flex justify-between text-slate-500"><span>Shipping</span><span>{fmt(selectedOrder.shipping_cents)}</span></div>
                <div className="flex justify-between text-slate-500"><span>Tax</span><span>{fmt(selectedOrder.tax_cents)}</span></div>
                <div className="flex justify-between font-bold"><span>Total</span><span>{fmt(selectedOrder.total_cents)}</span></div>
              </div>
            </div>
            {selectedOrder.tracking_number && <p className="mt-3 text-sm"><span className="text-slate-500">Tracking:</span> <span className="font-mono">{selectedOrder.tracking_number}</span></p>}
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Fulfillment</span>
                <select value={selectedOrder.fulfillment_status}
                  onChange={(e) => updateOrder(selectedOrder.id, { fulfillment_status: e.target.value })}
                  disabled={orderSaving} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  {['unfulfilled', 'fulfilled', 'shipped', 'delivered', 'cancelled'].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-slate-500">Tracking number</span>
                <input defaultValue={selectedOrder.tracking_number ?? ''} key={selectedOrder.tracking_number}
                  onBlur={(e) => { if (e.target.value !== (selectedOrder.tracking_number ?? '')) updateOrder(selectedOrder.id, { tracking_number: e.target.value }); }}
                  placeholder="1Z…" className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
              </label>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={orderSaving}
                onClick={() => { if (confirm(`Refund order #${selectedOrder.id}? This marks it refunded locally — process the actual refund in Stripe.`)) updateOrder(selectedOrder.id, { status: 'refunded' }); }}>
                Mark refunded
              </Button>
              <a href={`https://dashboard.stripe.com/search?query=${encodeURIComponent(selectedOrder.email)}`} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
                Open in Stripe <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShop;
