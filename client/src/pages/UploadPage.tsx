import { useRef, useState } from 'react';
import { useUploadLocations } from '../hooks/useApi';
import { useUIStore } from '../store/ui';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const upload = useUploadLocations();
  const show = useUIStore((s) => s.show);

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
      },
      onError: (err: any) => {
        show(err?.message ?? 'Upload failed', 'error', 3000);
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-slate-900">Upload Locations</h1>
      <p className="mt-1 text-sm text-slate-600">
        Upload a single ZIP file that contains exactly one .txt file. Each line format examples:{' '}
        <code className="rounded bg-slate-100 px-1 py-0.5">name,lat,lng</code>{' '}
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
  );
}