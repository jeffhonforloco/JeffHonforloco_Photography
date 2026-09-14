export type GrowthRecord = Record<string, string | number | boolean | null>;

const authHeaders = (json = false): HeadersInit => ({
  Authorization: `Bearer ${localStorage.getItem('adminToken') ?? ''}`,
  ...(json ? { 'Content-Type': 'application/json' } : {}),
});

export async function growthGet<T>(path: string): Promise<T> {
  const response = await fetch(`/api/v1/admin/growth/${path}`, { headers: authHeaders() });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? 'Unable to load growth data');
  return payload.data as T;
}

export async function growthPost<T>(path: string, body: GrowthRecord): Promise<T> {
  const response = await fetch(`/api/v1/admin/growth/${path}`, {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? 'Unable to save growth data');
  return payload.data as T;
}

export async function growthPatch<T>(path: string, body: GrowthRecord): Promise<T> {
  const response = await fetch(`/api/v1/admin/growth/${path}`, {
    method: 'PATCH',
    headers: authHeaders(true),
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error ?? 'Unable to update growth data');
  return payload.data as T;
}

export const displayValue = (value: unknown): string => {
  if (value === null || value === undefined || value === '') return 'No data yet';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return String(value);
};
