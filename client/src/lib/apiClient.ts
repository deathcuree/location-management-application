import axios, { type AxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  // Do not set a default Content-Type here.
  // Axios will automatically set:
  // - application/json for plain objects
  // - multipart/form-data with boundary for FormData
});

export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const res = await apiClient(config);
    return res.data as T;
  } catch (error: any) {
    if (error?.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error?.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw error;
  }
}