import axios, { AxiosError } from 'axios';
import { getItemAsync, setItemAsync, deleteItemAsync } from './storage';
import { API_URL } from '../config/env';

const TOKEN_KEY = 'nhb_auth_token';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
  },
  timeout: 15000,
});

export async function getStoredToken(): Promise<string | null> {
  return getItemAsync(TOKEN_KEY);
}

export async function setStoredToken(token: string | null): Promise<void> {
  if (token) {
    await setItemAsync(TOKEN_KEY, token);
  } else {
    await deleteItemAsync(TOKEN_KEY);
  }
}

// Attache automatiquement le token Bearer (Sanctum) à chaque requête.
apiClient.interceptors.request.use(async (config) => {
  const token = await getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Erreur normalisée : { message, errors } — `errors` reprend le format de
 * validation Laravel ({ field: [messages] }) quand il est présent.
 */
export type ApiError = {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
};

export function parseApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
    return {
      message: err.response?.data?.message ?? "Une erreur réseau est survenue. Vérifiez votre connexion.",
      errors: err.response?.data?.errors,
      status: err.response?.status,
    };
  }
  return { message: "Une erreur inattendue est survenue." };
}
