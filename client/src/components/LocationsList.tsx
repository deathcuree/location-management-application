import type { ReactNode } from 'react';

export type LocationListItem = {
  id: number | string;
  name: string;
  lat: number;
  lng: number;
};

export type LocationsListProps = {
  locations: LocationListItem[];
  className?: string;
  emptyText?: string;
  loadingText?: string;
  errorText?: string;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  onSelect?: (loc: LocationListItem) => void;
  onDelete?: (loc: LocationListItem) => void;
  isDeleting?: boolean;
  renderItemExtra?: (loc: LocationListItem) => ReactNode;
  deleteLabel?: string;
  focusTitle?: string;
};

export default function LocationsList({
  locations,
  className,
  emptyText = 'No locations yet',
  loadingText = 'Loading...',
  errorText = 'Failed to load',
  isLoading = false,
  isError = false,
  error,
  onSelect,
  onDelete,
  isDeleting = false,
  renderItemExtra,
  deleteLabel = 'Delete',
  focusTitle = 'Focus on map',
}: LocationsListProps) {
  return (
    <div className={className}>
      {isLoading && <div className="text-slate-600">{loadingText}</div>}
      {isError && <div className="text-rose-600">Error: {(error as any)?.message ?? errorText}</div>}
      {!isLoading && !isError && locations.length === 0 && <div className="text-slate-600">{emptyText}</div>}
      {!isLoading && !isError && locations.length > 0 && (
        <ul className="divide-y divide-slate-200 rounded border border-slate-200">
          {locations.map((loc) => (
            <li key={loc.id} className="flex items-center justify-between gap-3 p-3 hover:bg-slate-50">
              <button
                type="button"
                onClick={() => onSelect?.(loc)}
                className="flex-1 text-left"
                title={focusTitle}
              >
                <div className="font-semibold">{loc.name}</div>
                <div className="text-xs text-slate-600">
                  {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                </div>
              </button>
              {renderItemExtra ? <div>{renderItemExtra(loc)}</div> : null}
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(loc);
                  }}
                  disabled={isDeleting}
                  className="rounded border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                >
                  {deleteLabel}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}