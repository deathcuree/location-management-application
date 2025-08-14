export function validateZip(file: File): string | null {
  if (!file) return 'Please choose a file';
  const name = file.name.toLowerCase();
  if (!name.endsWith('.zip')) return 'Please select a .zip file';
  return null;
}