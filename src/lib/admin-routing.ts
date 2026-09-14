export const ADMIN_HOSTNAME = 'admin.jeffhonforlocophotos.com';

export const isAdminHostname = (hostname?: string): boolean => {
  const currentHostname = hostname ?? (typeof window === 'undefined' ? '' : window.location.hostname);
  return currentHostname === ADMIN_HOSTNAME || currentHostname.startsWith('admin.localhost');
};

export const adminPath = (path = ''): string => {
  const normalized = path ? `/${path.replace(/^\/+/, '')}` : '';
  return isAdminHostname() ? normalized || '/' : `/admin${normalized}`;
};
