import { apiClient } from './client';

export type Order = {
  id: number;
  reference: string;
  book_titre: string;
  quantite: number;
  prix_unitaire: number;
  total: number;
  mode_paiement: string;
  mode_paiement_label: string;
  statut: 'en_attente_livraison' | 'en_livraison' | 'livree' | 'annulee';
  statut_label: string;
  seller: { id: number; nom: string } | null;
  deliverer: { nom: string; telephone: string } | null;
  created_at: string;
};

export type PlaceOrderPayload = {
  book_id: number;
  quantite: number;
  mode_paiement: string;
  reference_paiement: string;
};

export async function fetchOrders() {
  const { data } = await apiClient.get<{ data: Order[] }>('/orders');
  return data.data;
}

export async function placeOrder(payload: PlaceOrderPayload) {
  const { data } = await apiClient.post<{ data: Order; message: string }>('/orders', payload);
  return data;
}
