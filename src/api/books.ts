import { apiClient } from './client';

export type Book = {
  id: number;
  titre: string;
  auteur: string | null;
  categorie: string | null;
  etat: 'neuf' | 'tres_bon_etat' | 'bon_etat';
  quantite: number;
  en_stock: boolean;

  /** Prix CLIENT payé (déjà remisé si promotion, commission incluse). */
  prix_achat: number | null;
  /** Prix client avant promotion (null hors promo). */
  prix_original?: number | null;
  en_promo?: boolean;
  /** Badge prêt à afficher : "-20%" ou "-1 100 Ar". */
  promo_label?: string | null;

  prix_location: number | null;
  livraison_disponible: boolean;
  image_url: string;
  description?: string;
  langue: string | null;
  langue_label: string | null;
  format: string | null;
  format_label: string | null;
  nombre_pages?: number | null;
  pages_label?: string | null;
  /** Délai en heures ou en jours, déjà traduit. */
  delai_livraison_label?: string;
  seller: { id: number; nom: string; localisation: string | null } | null;
};

export type PaymentAccount = {
  key: string;
  label: string;
  numero: string;
  nom: string;
};

/* ============ Livraison (zones / quartiers / coopératives / VIP) ============ */

export type DeliveryQuartier = { id: number; nom: string; frais: number };
export type DeliveryCooperative = { id: number; nom: string };

export type DeliveryZone = {
  id: number;
  nom: string;
  /** true = Antananarivo : quartiers, VIP et espèces possibles. */
  capitale: boolean;
  frais: number;
  /** Fourchette de délai déjà traduite (ex. "24 à 48 h"). */
  label: string;
  quartiers: DeliveryQuartier[];
  cooperatives: DeliveryCooperative[];
};

export type DeliverySlot = { value: string; label: string };

export type DeliveryConfig = {
  /** Livraison offerte (tous les livres viennent du compte officiel). */
  free: boolean;
  longDelay: boolean;
  standardMaxH: number;
  leadLabel: string;
  vip: {
    enabled: boolean;
    leadOk: boolean;
    maxLeadH: number;
    surcharge: number;
    label: string;
    slots: DeliverySlot[];
  };
  zones: DeliveryZone[];
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

/** Config de livraison du panier : le délai dépend du livre le plus lent. */
export async function fetchDeliveryConfig(bookIds: number[]) {
  const { data } = await apiClient.post<{ data: DeliveryConfig }>('/delivery-config', {
    book_ids: bookIds,
  });
  return data.data;
}