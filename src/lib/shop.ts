import { useEffect, useState } from 'react';
import { apiUrl } from './api-base';

export interface ShopPublicSettings {
  shop_enabled: boolean;
  store_name: string;
  flat_shipping_cents: number;
  free_shipping_over_cents: number;
  tax_rate_percent: number;
  currency: string;
  store_email: string;
}

let cached: ShopPublicSettings | null = null;
let inFlight: Promise<ShopPublicSettings | null> | null = null;

export function fetchShopSettings(): Promise<ShopPublicSettings | null> {
  if (cached) return Promise.resolve(cached);
  if (inFlight) return inFlight;
  inFlight = fetch(apiUrl('/api/v1/shop/settings/public'))
    .then(async (res) => {
      if (!res.ok) return null;
      const data = await res.json().catch(() => null);
      const s = data?.data as ShopPublicSettings | undefined;
      if (s && typeof s.shop_enabled === 'boolean') {
        cached = s;
        return s;
      }
      return null;
    })
    .catch(() => null)
    .finally(() => { inFlight = null; });
  return inFlight;
}

/**
 * Returns true when Jeff has flipped the shop ON in Admin → Shop → Settings.
 * Defaults to false (shop hidden) while loading or on error.
 */
export function useShopEnabled(): { enabled: boolean; loading: boolean } {
  const [state, setState] = useState<{ enabled: boolean; loading: boolean }>({ enabled: false, loading: true });
  useEffect(() => {
    let alive = true;
    fetchShopSettings().then((s) => {
      if (alive) setState({ enabled: s?.shop_enabled === true, loading: false });
    });
    return () => { alive = false; };
  }, []);
  return state;
}

export function clearShopSettingsCache() {
  cached = null;
}
