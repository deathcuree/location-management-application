import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { request } from '../lib/apiClient';
import type {
  AuthResponse,
  LoginBody,
  RegisterBody,
  LocationsResponse,
  CreateLocationBody,
  CreateLocationResponse,
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
  return useMutation({
    mutationFn: (body: CreateLocationBody) =>
      request<CreateLocationResponse>({
        url: '/api/locations',
        method: 'POST',
        data: body,
      }),
    onSuccess: () => {
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
        headers: {
          // Let axios set the correct boundary; providing this is fine with axios
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEYS.locations });
    },
  });
}