import { useEffect, useState } from 'react';

const LEAFLET_VERSION = '1.9.4';
const CSS_ID = 'leaflet-cdn-css';
const JS_ID = 'leaflet-cdn-js';

let loaderPromise: Promise<void> | null = null;

function loadLeaflet(): Promise<void> {
  if (typeof window !== 'undefined' && (window as any).L) {
    return Promise.resolve();
  }
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<void>((resolve, reject) => {
    if (!document.getElementById(CSS_ID)) {
      const link = document.createElement('link');
      link.id = CSS_ID;
      link.rel = 'stylesheet';
      link.href = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
      document.head.appendChild(link);
    }

    const existing = document.getElementById(JS_ID) as HTMLScriptElement | null;
    if (existing) {
      if ((window as any).L) resolve();
      else existing.addEventListener('load', () => resolve());
      return;
    }

    const script = document.createElement('script');
    script.id = JS_ID;
    script.src = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Leaflet from CDN'));
    document.body.appendChild(script);
  });

  return loaderPromise;
}

export function useLeaflet(): { ready: boolean; error: string | null } {
  const [ready, setReady] = useState<boolean>(
    typeof window !== 'undefined' && !!(window as any).L
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadLeaflet()
      .then(() => active && setReady(true))
      .catch((e) => active && setError(e.message));
    return () => {
      active = false;
    };
  }, []);

  return { ready, error };
}
