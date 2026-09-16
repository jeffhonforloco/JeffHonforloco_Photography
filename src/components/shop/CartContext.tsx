import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface CartLine {
  product_id: number;
  variant_id: number | null;
  quantity: number;
  name: string;
  variant_label: string | null;
  price_cents: number;
  image_url: string | null;
  slug: string;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal_cents: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addLine: (line: Omit<CartLine, 'quantity'>, quantity?: number) => void;
  updateQty: (product_id: number, variant_id: number | null, quantity: number) => void;
  removeLine: (product_id: number, variant_id: number | null) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'jh_shop_cart_v1';

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((l) => l && typeof l.product_id === 'number') : [];
  } catch {
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lines, setLines] = useState<CartLine[]>(() => load());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* ignore */ }
  }, [lines]);

  const addLine = useCallback((line: Omit<CartLine, 'quantity'>, quantity = 1) => {
    setLines((prev) => {
      const idx = prev.findIndex((l) => l.product_id === line.product_id && (l.variant_id ?? null) === (line.variant_id ?? null));
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: Math.min(next[idx].quantity + quantity, 99) };
        return next;
      }
      return [...prev, { ...line, quantity: Math.min(quantity, 99) }];
    });
    setIsOpen(true);
  }, []);

  const updateQty = useCallback((product_id: number, variant_id: number | null, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => !(l.product_id === product_id && (l.variant_id ?? null) === (variant_id ?? null)))
        : prev.map((l) => (l.product_id === product_id && (l.variant_id ?? null) === (variant_id ?? null) ? { ...l, quantity: Math.min(quantity, 99) } : l))
    );
  }, []);

  const removeLine = useCallback((product_id: number, variant_id: number | null) => {
    setLines((prev) => prev.filter((l) => !(l.product_id === product_id && (l.variant_id ?? null) === (variant_id ?? null))));
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((s, l) => s + l.quantity, 0);
    const subtotal_cents = lines.reduce((s, l) => s + l.price_cents * l.quantity, 0);
    return { lines, count, subtotal_cents, isOpen, openCart, closeCart, addLine, updateQty, removeLine, clear };
  }, [lines, isOpen, openCart, closeCart, addLine, updateQty, removeLine, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}

export function formatUSD(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
