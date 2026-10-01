import { useEffect, useRef } from 'react';
import { useLeaflet } from '../hooks/useLeaflet';
import { hasCoords, type LatLng } from '../utils/geo';

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  kind: 'sos' | 'hospital' | 'self' | 'team' | 'ambulance' | 'drone';
  title: string;
  popupHtml?: string;
  pulse?: boolean;
}

interface LiveMapProps {
  markers: MapMarker[];
  focus?: LatLng | null;
  focusZoom?: number;
  defaultCenter?: LatLng;
  defaultZoom?: number;
  onMarkerClick?: (id: string) => void;
  className?: string;
  routeLine?: [LatLng, LatLng] | null;
}

const KIND_STYLE: Record<MapMarker['kind'], { color: string; emoji: string }> = {
  sos: { color: '#ef4444', emoji: '🚨' },
  hospital: { color: '#3b82f6', emoji: '🏥' },
  self: { color: '#10b981', emoji: '📍' },
  team: { color: '#f59e0b', emoji: '🦺' },
  ambulance: { color: '#adc6ff', emoji: '🚑' },
  drone: { color: '#4ae176', emoji: '🚁' },
};

const CHENNAI: LatLng = { latitude: 13.0827, longitude: 80.2707 };

export default function LiveMap({
  markers,
  focus,
  focusZoom = 15,
  defaultCenter = CHENNAI,
  defaultZoom = 12,
  onMarkerClick,
  className = '',
  routeLine = null,
}: LiveMapProps) {
  const { ready, error } = useLeaflet();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);
  const routeLayerRef = useRef<any>(null);
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  useEffect(() => {
    if (!ready || !containerRef.current || mapRef.current) return;
    const L = (window as any).L;

    const map = L.map(containerRef.current, {
      center: [defaultCenter.latitude, defaultCenter.longitude],
      zoom: defaultZoom,
      zoomControl: true,
      attributionControl: true,
    });

    // Base map. CARTO basemaps now need an API key (tiles come back stamped
    // "API KEY REQUIRED"), so use free OpenStreetMap tiles and darken them
    // with a CSS filter to match the dashboard. Only the tile images are
    // filtered — markers, popups and routes keep their real colours.
    // Set VITE_MAP_TILE_URL to use a different provider (e.g. a keyed one).
    const customTiles = (import.meta as any).env?.VITE_MAP_TILE_URL as string | undefined;
    if (!customTiles && !document.getElementById('rq-dark-tiles-style')) {
      const style = document.createElement('style');
      style.id = 'rq-dark-tiles-style';
      style.textContent =
        '.rq-dark-tiles{filter:invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%) saturate(60%);}' +
        '.leaflet-container{background:#0b1220;}';
      document.head.appendChild(style);
    }
    L.tileLayer(customTiles || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
      className: customTiles ? '' : 'rq-dark-tiles',
    }).addTo(map);

    mapRef.current = map;
    markerLayerRef.current = L.layerGroup().addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);

    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [ready]);

  useEffect(() => {
    if (!ready || !mapRef.current || !markerLayerRef.current) return;
    const L = (window as any).L;
    const layer = markerLayerRef.current;
    layer.clearLayers();

    const valid = markers.filter((m) => hasCoords(m));

    valid.forEach((m) => {
      const style = KIND_STYLE[m.kind] || { color: '#64748b', emoji: '📍' };
      const size = m.kind === 'sos' ? 34 : 28;
      const pulseRing = m.pulse
        ? `<span style="position:absolute;inset:-6px;border-radius:9999px;border:2px solid ${style.color};opacity:.6;animation:rqpulse 1.6s ease-out infinite;"></span>`
        : '';
      const html = `
        <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
          ${pulseRing}
          <div style="width:${size}px;height:${size}px;border-radius:9999px;background:${style.color};border:2px solid #0f172a;box-shadow:0 2px 8px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;font-size:${size * 0.5}px;">${style.emoji}</div>
        </div>`;

      const icon = L.divIcon({
        html,
        className: 'rq-div-icon',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
      });

      const marker = L.marker([m.latitude, m.longitude], { icon }).addTo(layer);
      if (m.popupHtml) marker.bindPopup(m.popupHtml);
      if (onMarkerClickRef.current) {
        marker.on('click', () => onMarkerClickRef.current?.(m.id));
      }
    });

    if (!focus && valid.length > 0) {
      const bounds = L.latLngBounds(valid.map((m) => [m.latitude, m.longitude]));
      mapRef.current.fitBounds(bounds.pad(0.25), { maxZoom: 15 });
    }
  }, [ready, markers, focus]);

  useEffect(() => {
    if (!ready || !routeLayerRef.current) return;
    const L = (window as any).L;
    routeLayerRef.current.clearLayers();
    if (routeLine && hasCoords(routeLine[0]) && hasCoords(routeLine[1])) {
      L.polyline(
        [
          [routeLine[0].latitude, routeLine[0].longitude],
          [routeLine[1].latitude, routeLine[1].longitude],
        ],
        { color: '#38bdf8', weight: 3, dashArray: '8 8', opacity: 0.9 }
      ).addTo(routeLayerRef.current);
    }
  }, [ready, routeLine]);

  useEffect(() => {
    if (!ready || !mapRef.current || !focus || !hasCoords(focus)) return;
    mapRef.current.flyTo([focus.latitude, focus.longitude], focusZoom, {
      duration: 0.8,
    });
  }, [ready, focus, focusZoom]);

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-slate-900 rounded-xl border border-slate-800 ${className}`}>
        <p className="text-slate-500 text-sm px-4 text-center">
          Map failed to load ({error}). Check connection to unpkg.com.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!ready && (
        <div className="absolute inset-0 z-[400] flex items-center justify-center bg-slate-900/80 rounded-xl">
          <div className="text-center">
            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-slate-400 text-xs">Loading map…</p>
          </div>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full rounded-xl overflow-hidden z-0" />
      <style>{`
        @keyframes rqpulse { 0% { transform: scale(.7); opacity: .8; } 100% { transform: scale(2.2); opacity: 0; } }
        .rq-div-icon { background: transparent; border: none; }
        .leaflet-popup-content-wrapper { background:#1e293b; color:#e2e8f0; border:1px solid #334155; border-radius:10px; }
        .leaflet-popup-tip { background:#1e293b; border:1px solid #334155; }
        .leaflet-container { background:#0f172a; font-family: inherit; }
        .leaflet-bar a { background:#1e293b; color:#e2e8f0; border-color:#334155; }
        .leaflet-bar a:hover { background:#334155; }
      `}</style>
    </div>
  );
}
