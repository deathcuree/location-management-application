export type User = {
  id: number;
  name: string;
  email: string;
};

export type AuthResponse = {
  user: User;
};

export type LoginBody = {
  email: string;
  password: string;
};

export type RegisterBody = {
  name: string;
  email: string;
  password: string;
};

export type Location = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export type LocationsResponse = {
  locations: Location[];
};

export type CreateLocationBody = {
  name: string;
  lat: number;
  lng: number;
};

export type CreateLocationResponse = Location;

export type UploadResponse = {
  inserted: number;
  totalParsed: number;
  invalidRows: number;
};