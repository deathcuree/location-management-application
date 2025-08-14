import { useEffect, useMemo, useRef, useState } from 'react';
import { useUploadLocations, useLocations } from '../hooks/useApi';
import { useUIStore } from '../store/ui';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { setupLeafletDefaultIcon } from '../lib/leafletFix';

// Ensure Leaflet default marker icons are configured BEFORE any Marker mounts
setupLeafletDefaultIcon();

function MapController({ locations }: { locations: { lat: number; lng: number }[] }) {
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
  return null;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const upload = useUploadLocations();
  const show = useUIStore((s) => s.show);
  const { data, isLoading, isError, error } = useLocations();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setFile(null);
      return;
    }
    if (!f.name.toLowerCase().endsWith('.zip')) {
      show('Please select a .zip file', 'error');
      e.target.value = '';
      setFile(null);
      return;
    }
    setFile(f);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      show('Please choose a .zip file to upload', 'error');
      return;
    }
    upload.mutate(file, {
      onSuccess: (res) => {
        show(`Upload successful: inserted ${res.inserted} location(s)`, 'success', 3000);
        // Reset input
        setFile(null);
        if (inputRef.current) inputRef.current.value = '';
        // Locations list will auto-refresh via react-query invalidation in useUploadLocations()
        // Map bounds will auto-fit using MapController when data updates.
      },
      onError: (err: any) => {
        show(err?.message ?? 'Upload failed', 'error', 3000);
      },
    });
  };

  const center = useMemo<[number, number]>(() => {
    const first = data?.locations?.[0];
    if (first) return [first.lat, first.lng];
    return [14.5995, 120.9842]; // Manila default
  }, [data]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Upload Locations</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload a single ZIP file that contains exactly one .txt file. Each line format examples:{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5">Name, Latitude, Longitude</code>{' '}
          or{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5">name[TAB]lat[TAB]lng</code>{' '}
          or{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5">name|lat|lng</code>.
        </p>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <input
              ref={inputRef}
              type="file"
              accept=".zip"
              onChange={onFileChange}
              className="block w-full cursor-pointer rounded border border-slate-300 p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
            />
            {file ? (
              <div className="mt-2 text-xs text-slate-600">Selected: {file.name}</div>
            ) : (
              <div className="mt-2 text-xs text-slate-500">No file selected</div>
            )}
          </div>

          <button
            type="submit"
            disabled={upload.isPending}
            className="rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
          >
            {upload.isPending ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="h-[420px]">
          <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
            <MapController locations={data?.locations ?? []} />
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