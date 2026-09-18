import { apiClient } from './client';

export type BuyerProfile = {
  localisation: string | null;
  motif_inscription: string | null;
  types_livres_recherches: string | null;
};

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  role: 'client' | 'vendeur';
  profile: BuyerProfile | null;
};

export type LoginPayload = { email: string; password: string };

export type RegisterPayload = {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  localisation?: string;
  motif_inscription?: string;
  types_livres_recherches?: string;
};

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<{ user: AuthUser; token: string }>('/login', {
    ...payload,
    device_name: 'mobile-app',
  });
  return data;
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post<{ user: AuthUser; token: string }>('/register', {
    ...payload,
    device_name: 'mobile-app',
  });
  return data;
}

export async function logout() {
  await apiClient.post('/logout');
}

export async function fetchMe() {
  const { data } = await apiClient.get<{ user: AuthUser }>('/me');
  return data.user;
}
