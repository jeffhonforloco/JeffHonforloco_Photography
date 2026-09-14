import { useEffect, useMemo } from 'react';
import { ADMIN_HOSTNAME } from '@/lib/admin-routing';

const getAdminDestination = (): string => {
  const suffix = window.location.pathname.replace(/^\/admin(?=\/|$)/, '') || '/';
  const port = window.location.hostname === 'localhost' ? window.location.port : '';
  const hostname = window.location.hostname === 'localhost' ? 'admin.localhost' : ADMIN_HOSTNAME;
  const authority = port ? `${hostname}:${port}` : hostname;
  return `${window.location.protocol}//${authority}${suffix}${window.location.search}${window.location.hash}`;
};

const AdminTransition = () => {
  const destination = useMemo(() => getAdminDestination(), []);

  useEffect(() => {
    window.location.replace(destination);
  }, [destination]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold">Opening the private command center</h1>
        <p className="mt-3 text-sm text-slate-300">
          If the redirect does not start automatically, use the secure admin link below.
        </p>
        <a className="mt-6 inline-flex rounded-md bg-photo-red px-5 py-3 font-medium text-white" href={destination}>
          Continue to admin
        </a>
      </div>
    </main>
  );
};

export default AdminTransition;
