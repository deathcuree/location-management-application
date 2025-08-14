import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useCreateLocation, useLocations } from '../hooks/useApi';
import { setupLeafletDefaultIcon } from '../lib/leafletFix';
import { useUIStore } from '../store/ui';

type FormState = {
  name: string;
  lat: string;
  lng: string;
};

export default function MapPage() {
  const { data, isLoading, isError, error } = useLocations();
  const createLocation = useCreateLocation();
  const show = useUIStore((s) => s.show);

  const [form, setForm] = useState<FormState>({ name: '', lat: '', lng: '' });

  useEffect(() => {
    setupLeafletDefaultIcon();
  }, []);

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
        onSuccess: () => {
          show('Location added', 'success');
          setForm({ name: '', lat: '', lng: '' });
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
            value={form.lat}
            onChange={onChange}
            className="rounded border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          />
          <input
            name="lng"
            placeholder="Longitude"
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

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="h-[520px]">
          <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
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