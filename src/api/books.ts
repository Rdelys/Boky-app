import { apiClient } from './client';

export type Book = {
  id: number;
  titre: string;
  auteur: string | null;
  categorie: string | null;
  etat: 'neuf' | 'tres_bon_etat' | 'bon_etat';
  quantite: number;
  en_stock: boolean;
  prix_achat: number | null;
  prix_location: number | null;
  livraison_disponible: boolean;
  image_url: string;
  description?: string;
  langue: string | null;
  langue_label: string | null;
  format: string | null;
  format_label: string | null;
  delai_livraison_label?: string;
  seller: { id: number; nom: string; localisation: string | null } | null;
};

export type PaymentAccount = {
  key: string;
  label: string;
  numero: string;
  nom: string;
};

export async function fetchBooks(params: { q?: string; categorie?: string; page?: number }) {
  const { data } = await apiClient.get<{
    data: Book[];
    meta: { current_page: number; last_page: number; total: number; per_page: number };
  }>('/books', { params });
  return data;
}

export async function fetchBook(id: number) {
  const { data } = await apiClient.get<{ data: Book }>(`/books/${id}`);
  return data.data;
}

export async function fetchCategories() {
  const { data } = await apiClient.get<{ data: string[] }>('/categories');
  return data.data;
}

export async function fetchPaymentAccounts() {
  const { data } = await apiClient.get<{ data: PaymentAccount[] }>('/payment-accounts');
  return data.data;
}

export type Villes = { data: string[]; ville_especes: string };

export async function fetchVilles(): Promise<Villes> {
  const { data } = await apiClient.get<Villes>('/villes');
  return data;
}