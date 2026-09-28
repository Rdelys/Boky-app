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
  groupe_reference: string | null; 
  facture_url: string | null;
};

export type PlaceOrderPayload = {
  items: { book_id: number; quantite: number }[];
  mode_paiement: string;
  reference_paiement: string;
  adresse_livraison: string;
  ville: string;
  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
};

export async function fetchOrders() {
  const { data } = await apiClient.get<{ data: Order[] }>('/orders');
  return data.data;
}

export async function placeOrder(payload: PlaceOrderPayload) {
  const { data } = await apiClient.post<{
    data: Order[];
    groupe_reference: string;
    message: string;
    invoice_url: string | null;
  }>('/orders', payload);
  return data;
}




