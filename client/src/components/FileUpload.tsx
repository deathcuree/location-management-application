import { useRef, useState, type ChangeEvent } from 'react';

export type FileUploadProps = {
  accept?: string;
  onSubmit: (file: File) => Promise<void> | void;
  isPending?: boolean;
  buttonLabel?: string;
  pendingLabel?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  showSelected?: boolean;
  onFileChange?: (file: File | null) => void;
  validateFile?: (file: File) => string | null;
  onValidationError?: (message: string) => void;
};

const baseContainer = 'mt-5 space-y-4';
const baseInput =
  'block w-full cursor-pointer rounded border border-slate-300 p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800';
const baseButton =
  'rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70';

export default function FileUpload({
  accept = '.zip',
  onSubmit,
  isPending = false,
  buttonLabel = 'Upload',
  pendingLabel = 'Uploading...',
  className,
  inputClassName,
  buttonClassName,
  showSelected = true,
  onFileChange,
  validateFile,
  onValidationError,
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;

    if (f && validateFile) {
      const msg = validateFile(f);
      if (msg) {
        onValidationError?.(msg);
        if (inputRef.current) inputRef.current.value = '';
        setFile(null);
        onFileChange?.(null);
        return;
      }
    }

    setFile(f);
    onFileChange?.(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    try {
      await onSubmit(file);
      // Clear only on successful submit
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch {
      // leave selection intact on error
    }
  };

  return (
    <form onSubmit={handleSubmit} className={[baseContainer, className].filter(Boolean).join(' ')}>
      <div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className={[baseInput, inputClassName].filter(Boolean).join(' ')}
        />
        {showSelected ? (
          file ? (
            <div className="mt-2 text-xs text-slate-600">Selected: {file.name}</div>
          ) : (
            <div className="mt-2 text-xs text-slate-500">No file selected</div>
          )
        ) : null}
      </div>

      <button type="submit" disabled={isPending} className={[baseButton, buttonClassName].filter(Boolean).join(' ')}>
        {isPending ? pendingLabel : buttonLabel}
      </button>
    </form>
  );
}