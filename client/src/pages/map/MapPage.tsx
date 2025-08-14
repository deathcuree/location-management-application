import { useState } from 'react';
import { useCreateLocation, useLocations, useDeleteLocation } from '../../hooks/useApi';
import { useUIStore } from '../../store/ui';
import LocationForm from '../../components/LocationForm';
import LocationMap, { type LatLng } from '../../components/LocationMap';
import LocationsList from '../../components/LocationsList';
import { validateCreateLocation } from './validation';

export default function MapPage() {
  const { data, isLoading, isError, error } = useLocations();
  const createLocation = useCreateLocation();
  const deleteLocation = useDeleteLocation();
  const show = useUIStore((s) => s.show);

  const [focusTarget, setFocusTarget] = useState<LatLng | null>(null);

  const handleCreate = async (values: { name: string; lat: string; lng: string }) => {
    const err = validateCreateLocation(values);
    if (err) {
      show(err, 'error');
      return false;
    }
    const payload = {
      name: values.name.trim(),
      lat: Number(values.lat),
      lng: Number(values.lng),
    };
    return await new Promise<boolean>((resolve) => {
      createLocation.mutate(payload, {
        onSuccess: (created) => {
          show('Location added', 'success');
          setFocusTarget({ lat: created.lat, lng: created.lng });
          resolve(true);
        },
        onError: (e: any) => {
          show(e?.message ?? 'Failed to add location', 'error');
          resolve(false);
        },
      });
    });
  };

  const locations = data?.locations ?? [];

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Add Location</h2>
        <LocationForm isPending={createLocation.isPending} onSubmit={handleCreate} />
      </section>

      <section className="mt-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Your Locations</h2>
        <div className="mt-3">
          <LocationsList
            locations={locations}
            isLoading={isLoading}
            isError={isError}
            error={error}
            onSelect={(loc) => setFocusTarget({ lat: loc.lat, lng: loc.lng })}
            onDelete={(loc) =>
              deleteLocation.mutate(loc.id as number, {
                onSuccess: () => show('Location deleted', 'success'),
                onError: (e: any) => show(e?.message ?? 'Failed to delete location', 'error'),
              })
            }
            isDeleting={deleteLocation.isPending}
          />
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <LocationMap locations={locations} flyTo={focusTarget} height={520} />
        <div className="border-t border-slate-200 p-3 text-sm">
          {isLoading && <span className="text-slate-600">Loading locations...</span>}
          {isError && <span className="text-rose-600">Error: {(error as any)?.message ?? 'Failed to load'}</span>}
          {!isLoading && !isError && <span className="text-slate-600">{locations.length} locations</span>}
        </div>
      </section>
    </div>
  );
}