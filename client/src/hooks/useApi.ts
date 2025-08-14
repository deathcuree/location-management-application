import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from '../lib/apiClient';
import type {
  AuthResponse,
  LoginBody,
  RegisterBody,
  LocationsResponse,
  CreateLocationBody,
  CreateLocationResponse,
  Location,
  UploadResponse,
} from '../types/api';
import { useAuthStore } from '../store/auth';

const KEYS = {
  locations: ['locations'] as const,
};

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (body: RegisterBody) =>
      request<AuthResponse>({
        url: '/api/auth/register',
        method: 'POST',
        data: body,
      }),
    onSuccess: (data) => {
      setUser(data.user);
    },
  });
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (body: LoginBody) =>
      request<AuthResponse>({
        url: '/api/auth/login',
        method: 'POST',
        data: body,
      }),
    onSuccess: (data) => {
      setUser(data.user);
    },
  });
}

export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  return useMutation({
    mutationFn: () =>
      request<{ message: string }>({
        url: '/api/auth/logout',
        method: 'POST',
      }),
    onSuccess: () => {
      clear();
    },
  });
}

export function useLocations() {
  return useQuery({
    queryKey: KEYS.locations,
    queryFn: () =>
      request<LocationsResponse>({
        url: '/api/locations',
        method: 'GET',
      }),
  });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  return useMutation<CreateLocationResponse, Error, CreateLocationBody, { prev?: LocationsResponse; tempId: number }>({
    mutationFn: (body: CreateLocationBody) =>
      request<CreateLocationResponse>({
        url: '/api/locations',
        method: 'POST',
        data: body,
      }),
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: KEYS.locations });
      const prev = qc.getQueryData<LocationsResponse>(KEYS.locations);
      const tempId = -Date.now();
      const optimistic: Location = {
        id: tempId,
        name: body.name,
        lat: body.lat,
        lng: body.lng,
        userId: user?.id ?? 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      qc.setQueryData<LocationsResponse>(KEYS.locations, (old) => ({
        locations: [optimistic, ...(old?.locations ?? [])],
      }));
      return { prev, tempId };
    },
    onError: (_err, _variables, context) => {
      if (context?.prev) {
        qc.setQueryData(KEYS.locations, context.prev);
      }
    },
    onSuccess: (data, _variables, context) => {
      qc.setQueryData<LocationsResponse>(KEYS.locations, (old) => {
        if (!old) return { locations: [data] };
        const idx = old.locations.findIndex((l) => l.id === context?.tempId);
        if (idx >= 0) {
          const copy = old.locations.slice();
          copy[idx] = data;
          return { locations: copy };
        }
        return { locations: [data, ...old.locations] };
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: KEYS.locations });
    },
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      request<void>({
        url: `/api/locations/${id}`,
        method: 'DELETE',
      }),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEYS.locations });
      const prev = qc.getQueryData<LocationsResponse>(KEYS.locations);
      qc.setQueryData<LocationsResponse>(KEYS.locations, (old) => ({
        locations: (old?.locations ?? []).filter((l) => l.id !== id),
      }));
      return { prev };
    },
    onError: (_err, _id, context) => {
      if (context?.prev) {
        qc.setQueryData(KEYS.locations, context.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: KEYS.locations });
    },
  });
}

export function useUploadLocations() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return request<UploadResponse>({
        url: '/api/upload',
        method: 'POST',
        data: formData,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.locations });
    },
  });
}