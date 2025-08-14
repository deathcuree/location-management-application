export type CreateLocationValues = {
  name: string;
  lat: string;
  lng: string;
};

export function validateCreateLocation(values: CreateLocationValues): string | null {
  const name = values.name?.trim() ?? '';
  if (!name) return 'Name is required';

  const lat = Number(values.lat);
  const lng = Number(values.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return 'Latitude and longitude must be valid numbers';
  if (lat < -90 || lat > 90) return 'Latitude must be between -90 and 90';
  if (lng < -180 || lng > 180) return 'Longitude must be between -180 and 180';

  return null;
}