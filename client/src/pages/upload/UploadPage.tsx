import { useUploadLocations, useLocations } from '../../hooks/useApi';
import { useUIStore } from '../../store/ui';
import FileUpload from '../../components/FileUpload';
import LocationMap from '../../components/LocationMap';
import { validateZip } from './validation';

export default function UploadPage() {
  const upload = useUploadLocations();
  const show = useUIStore((s) => s.show);
  const { data, isLoading, isError, error } = useLocations();

  const handleSubmit = async (file: File) =>
    await new Promise<void>((resolve, reject) => {
      const err = validateZip(file);
      if (err) {
        show(err, 'error', 3000);
        reject(new Error(err));
        return;
      }

      upload.mutate(file, {
        onSuccess: (res) => {
          show(`Upload successful: inserted ${res.inserted} location(s)`, 'success', 3000);
          resolve();
        },
        onError: (err: any) => {
          show(err?.message ?? 'Upload failed', 'error', 3000);
          reject(err ?? new Error('Upload failed'));
        },
      });
    });

  const locations = data?.locations ?? [];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Upload Locations</h1>
        <p className="mt-1 text-sm text-slate-600">
          Upload a single ZIP file that contains exactly one .txt file. Each line format examples:{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5">Name, Latitude, Longitude</code>{' '}
          or <code className="rounded bg-slate-100 px-1 py-0.5">name[TAB]lat[TAB]lng</code> or{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5">name|lat|lng</code>.
        </p>

        <FileUpload
          accept=".zip"
          isPending={upload.isPending}
          buttonLabel="Upload"
          pendingLabel="Uploading..."
          validateFile={validateZip}
          onValidationError={(m) => show(m, 'error')}
          onSubmit={handleSubmit}
        />
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <LocationMap locations={locations} height={420} />
        <div className="border-t border-slate-200 p-3 text-sm">
          {isLoading && <span className="text-slate-600">Loading locations...</span>}
          {isError && <span className="text-rose-600">Error: {(error as any)?.message ?? 'Failed to load'}</span>}
          {!isLoading && !isError && <span className="text-slate-600">{locations.length} locations</span>}
        </div>
      </section>
    </div>
  );
}