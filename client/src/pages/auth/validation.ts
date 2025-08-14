export function validateLogin(values: Record<string, string>): string | null {
  const email = values.email?.trim() ?? '';
  const password = values.password ?? '';
  if (!email || !password.trim()) return 'Email and password are required';
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email';
  return null;
}

export function validateRegister(values: Record<string, string>): string | null {
  const name = values.name?.trim() ?? '';
  const email = values.email?.trim() ?? '';
  const password = values.password ?? '';
  if (!name || !email || !password.trim()) return 'All fields are required';
  if (!/^\S+@\S+\.\S+$/.test(email)) return 'Enter a valid email';
  if (password.length < 6) return 'Password must be at least 6 characters';
  return null;
}