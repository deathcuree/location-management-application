import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { ReactNode, CSSProperties } from 'react';
import { setupLeafletDefaultIcon } from '../lib/leafletFix';

// Ensure Leaflet default marker icons are configured BEFORE any Marker mounts
setupLeafletDefaultIcon();

export type LatLng = { lat: number; lng: number };

export type BasicLocation = LatLng & {
  id?: number | string;
  name?: string;
};

export type LocationMapProps<T extends BasicLocation = BasicLocation> = {
  locations: T[];
  center?: [number, number];
  zoom?: number;
  className?: string;
  style?: CSSProperties;
  height?: number | string;
  tileUrl?: string;
  tileAttribution?: string;
  fitToLocations?: boolean;
  flyTo?: LatLng | null;
  onMarkerClick?: (loc: T) => void;
  renderPopup?: (loc: T) => ReactNode;
};

function Controller<T extends BasicLocation>({
  locations,
  fitToLocations = true,
  flyTo,
}: {
  locations: T[];
  fitToLocations?: boolean;
  flyTo?: LatLng | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!fitToLocations) return;
    if (locations?.length) {
      const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng] as [number, number]));
      if (bounds.isValid()) {
        try {
          (map as any).fitBounds(bounds, { padding: [40, 40] });
        } catch {
          // ignore
        }
      }
    }
  }, [map, locations, fitToLocations]);

  useEffect(() => {
    if (flyTo) {
      try {
        const currentZoom = (map as any).getZoom?.() ?? 12;
        (map as any).flyTo([flyTo.lat, flyTo.lng], Math.max(currentZoom, 14));
      } catch {
        // ignore
      }
    }
  }, [map, flyTo]);

  return null;
}

export default function LocationMap<T extends BasicLocation>({
  locations,
  center,
  zoom = 12,
  className,
  style,
  height = 520,
  tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  tileAttribution = '&copy; OpenStreetMap contributors',
  fitToLocations = true,
  flyTo = null,
  onMarkerClick,
  renderPopup,
}: LocationMapProps<T>) {
  const styleWithHeight: CSSProperties = {
    height: typeof height === 'number' ? `${height}px` : height,
    width: '100%',
    ...style,
  };

  // Provide a reasonable fallback center if none given and no locations
  const resolvedCenter: [number, number] =
    center ??
    (locations[0] ? [locations[0].lat, locations[0].lng] : ([14.5995, 120.9842] as [number, number])); // Manila default

  return (
    <div className={className} style={styleWithHeight}>
      <MapContainer center={resolvedCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <Controller locations={locations} fitToLocations={fitToLocations} flyTo={flyTo ?? undefined} />
        <TileLayer url={tileUrl} attribution={tileAttribution} />
        {locations.map((loc) => (
          <Marker key={(loc.id ?? `${loc.lat},${loc.lng}`) as any} position={[loc.lat, loc.lng]}>
            <Popup>
              {renderPopup ? (
                renderPopup(loc)
              ) : (
                <div
                  className="text-sm"
                  onClick={() => onMarkerClick?.(loc)}
                  role={onMarkerClick ? 'button' : undefined}
                >
                  {loc.name ? <div className="font-semibold">{loc.name}</div> : null}
                  <div className="text-xs text-slate-600">
                    {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                  </div>
                </div>
              )}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}