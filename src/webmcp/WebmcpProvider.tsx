import { useEffect } from 'react';

export const WebmcpProvider = () => {
  useEffect(() => {
    let disposed = false;
    let unregister: (() => void) | undefined;

    void Promise.all([import('@nekuda/webmcp-sdk'), import('./tools/site-tools')]).then(
      ([{ registerTools }, { siteTools }]) => {
        if (disposed) return;
        const registration = registerTools(siteTools, { telemetry: false });
        unregister = () => registration.unregister();
      },
    );

    return () => {
      disposed = true;
      unregister?.();
    };
  }, []);

  return null;
};
