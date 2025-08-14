import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useCreateLocation, useLocations, useDeleteLocation } from '../hooks/useApi';
import { setupLeafletDefaultIcon } from '../lib/leafletFix';
import { useUIStore } from '../store/ui';

function MapController({
  locations,
  flyTo,
}: {
  locations: { lat: number; lng: number }[];
  flyTo?: { lat: number; lng: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (locations?.length) {
      const bounds = L.latLngBounds(locations.map((l) => [l.lat, l.lng] as [number, number]));
      if (bounds.isValid()) {
        try {
          (map as any).fitBounds(bounds, { padding: [40, 40] });
        } catch {}
      }
    }
  }, [map, locations]);
  useEffect(() => {
    if (flyTo) {
      try {
        const currentZoom = (map as any).getZoom?.() ?? 12;
        (map as any).flyTo([flyTo.lat, flyTo.lng], Math.max(currentZoom, 14));
      } catch {}
    }
  }, [map, flyTo]);
  return null;
}

// Ensure Leaflet default marker icons are configured BEFORE any Marker mounts
setupLeafletDefaultIcon();

type FormState = {
  name: string;
  lat: string;
  lng: string;
};

export default function MapPage() {
  const { data, isLoading, isError, error } = useLocations();
  const createLocation = useCreateLocation();
  const deleteLocation = useDeleteLocation();
  const show = useUIStore((s) => s.show);

  const [form, setForm] = useState<FormState>({ name: '', lat: '', lng: '' });
  const [focusTarget, setFocusTarget] = useState<{ lat: number; lng: number } | null>(null);




  const center = useMemo<[number, number]>(() => {
    const first = data?.locations?.[0];
    if (first) return [first.lat, first.lng];
    return [14.5995, 120.9842]; // Manila default
  }, [data]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  function validate(): string | null {
    if (!form.name.trim()) return 'Name is required';
    const lat = Number(form.lat);
    const lng = Number(form.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return 'Latitude and longitude must be valid numbers';
    if (lat < -90 || lat > 90) return 'Latitude must be between -90 and 90';
    if (lng < -180 || lng > 180) return 'Longitude must be between -180 and 180';
    return null;
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      show(err, 'error');
      return;
    }
    createLocation.mutate(
      {
        name: form.name.trim(),
        lat: Number(form.lat),
        lng: Number(form.lng),
      },
      {
        onSuccess: (created) => {
          show('Location added', 'success');
          setForm({ name: '', lat: '', lng: '' });
          setFocusTarget({ lat: created.lat, lng: created.lng });
        },
        onError: (err: any) => {
          show(err?.message ?? 'Failed to add location', 'error');
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Add Location</h2>
        <form onSubmit={onSubmit} className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={onChange}
            className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
          <input
            name="lat"
            placeholder="Latitude"
            type="number"
            step="any"
            inputMode="decimal"
            value={form.lat}
            onChange={onChange}
            className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
          <input
            name="lng"
            placeholder="Longitude"
            type="number"
            step="any"
            inputMode="decimal"
            value={form.lng}
            onChange={onChange}
            className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
          <button
            type="submit"
            disabled={createLocation.isPending}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
          >
            {createLocation.isPending ? 'Adding...' : 'Add'}
          </button>
        </form>
      </section>

      <section className="mt-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Your Locations</h2>
        <div className="mt-3">
          {isLoading && <div className="text-slate-600">Loading...</div>}
          {isError && <div className="text-rose-600">Error: {(error as any)?.message ?? 'Failed to load'}</div>}
          {!isLoading && !isError && (data?.locations?.length ?? 0) === 0 && (
            <div className="text-slate-600">No locations yet</div>
          )}
          {!isLoading && !isError && (data?.locations?.length ?? 0) > 0 && (
            <ul className="divide-y divide-slate-200 rounded border border-slate-200">
              {data!.locations.map((loc) => (
                <li key={loc.id} className="flex items-center justify-between gap-3 p-3 hover:bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setFocusTarget({ lat: loc.lat, lng: loc.lng })}
                    className="flex-1 text-left"
                    title="Focus on map"
                  >
                    <div className="font-semibold">{loc.name}</div>
                    <div className="text-xs text-slate-600">
                      {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteLocation.mutate(loc.id, {
                        onSuccess: () => show('Location deleted', 'success'),
                        onError: (err: any) => show(err?.message ?? 'Failed to delete location', 'error'),
                      });
                    }}
                    disabled={deleteLocation.isPending}
                    className="rounded border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="h-[520px]">
          <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
            <MapController locations={data?.locations ?? []} flyTo={focusTarget} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {!isLoading &&
              !isError &&
              data?.locations?.map((loc) => (
                <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold">{loc.name}</div>
                      <div className="text-xs text-slate-600">
                        {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
        <div className="border-t border-slate-200 p-3 text-sm">
          {isLoading && <span className="text-slate-600">Loading locations...</span>}
          {isError && <span className="text-rose-600">Error: {(error as any)?.message ?? 'Failed to load'}</span>}
          {!isLoading && !isError && (
            <span className="text-slate-600">{data?.locations?.length ?? 0} locations</span>
          )}
        </div>
      </section>
    </div>
  );
}