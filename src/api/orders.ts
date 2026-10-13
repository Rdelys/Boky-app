import { apiClient } from './client';

export type DeliveryInfo = {
  type: 'standard' | 'vip';
  type_label: string;
  zone: string;
  lieu: string;
  frais: number;
  frais_gratuit: boolean;
  frais_a_confirmer: boolean;
  taxi_brousse_pa: boolean;
  heure_prevue: string | null;
  delai_min_h: number;
  delai_max_h: number;
};

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
  livraison: DeliveryInfo | null;
  created_at: string;
  groupe_reference: string | null;
  facture_url: string | null;
};

export type PlaceOrderPayload = {
  items: { book_id: number; quantite: number }[];
  mode_paiement: string;
  reference_paiement: string;
  adresse_livraison: string;

  // Livraison (mêmes champs que le formulaire du site)
  ville: string;
  livraison_type: 'standard' | 'vip';
  quartier_id?: string; // id du quartier, ou "autre"
  quartier_autre?: string;
  cooperative_id?: string; // id de la coopérative, ou "autre"
  cooperative_autre?: string;
  heure_prevue?: string; // "YYYY-MM-DD HH:mm" (VIP)

  guest_name?: string;
  guest_phone?: string;
  guest_email?: string;
};

export type PlaceOrderResponse = {
  data: Order[];
  groupe_reference: string;
  message: string;
  invoice_url: string | null;
  livraison: DeliveryInfo | null;
  sous_total: number;
  total_a_payer: number;
};

export async function fetchOrders() {
  const { data } = await apiClient.get<{ data: Order[] }>('/orders');
  return data.data;
}

export async function placeOrder(payload: PlaceOrderPayload) {
  const { data } = await apiClient.post<PlaceOrderResponse>('/orders', payload);
  return data;
}