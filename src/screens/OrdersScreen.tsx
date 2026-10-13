import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchOrders, Order } from '../api/orders';
import { parseApiError } from '../api/client';
import { EmptyState } from '../components/EmptyState';
import { orderStatusColors, colors, fonts, radius, shadows } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';
import { downloadInvoice } from '../utils/invoice';

function formatAr(n: number) {
  return `${Math.round(n).toLocaleString('fr-FR')} Ar`;
}

export function OrdersScreen() {
  const { t } = useLocale();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchOrders();
      setOrders(data);
    } catch (e) {
      setError(parseApiError(e).message);
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.maroon900} />
      </View>
    );
  }

  if (error) {
    return <EmptyState icon="cloud-offline-outline" title={error} tone="danger" />;
  }

  if (orders.length === 0) {
    return <EmptyState icon="receipt-outline" title={t('order_none_yet')} />;
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={{ padding: 16 }}
      data={orders}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.maroon900} />}
      renderItem={({ item }) => {
        const statusColors = orderStatusColors(item.statut);
        const liv = item.livraison;
        const feeText = !liv
          ? ''
          : liv.frais_gratuit && liv.frais === 0
          ? t('delivery_fee_free')
          : liv.frais_a_confirmer
          ? t('delivery_fee_tbd')
          : formatAr(liv.frais);

        return (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.reference}>{item.reference}</Text>
                {item.groupe_reference ? <Text style={styles.reference}>{item.groupe_reference}</Text> : null}
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
                <Text style={[styles.statusText, { color: statusColors.text }]}>{item.statut_label}</Text>
              </View>
            </View>
            <Text style={styles.bookTitle}>{item.book_titre}</Text>
            {item.seller ? <Text style={styles.seller}>{item.seller.nom}</Text> : null}
            <View style={styles.cardFootRow}>
              <Text style={styles.qty}>x{item.quantite}</Text>
              <Text style={styles.total}>{formatAr(item.total)}</Text>
            </View>

            {liv ? (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={14} color={colors.muted} />
                <Text style={styles.info}>
                  {liv.type_label} · {liv.lieu} · {t('delivery_fee_label')} : {feeText}
                </Text>
              </View>
            ) : null}

            {item.deliverer ? (
              <View style={styles.infoRow}>
                <Ionicons name="bicycle-outline" size={14} color={colors.muted} />
                <Text style={styles.info}>
                  {item.deliverer.nom} — {item.deliverer.telephone}
                </Text>
              </View>
            ) : null}

            {item.facture_url ? (
              <Pressable
                onPress={() => downloadInvoice(item.facture_url!, item.groupe_reference ?? item.reference)}
                style={styles.invoiceBtn}
                hitSlop={6}
              >
                <Ionicons name="document-text-outline" size={14} color={colors.maroon800} />
                <Text style={styles.invoiceText}>{t('order_download_invoice')}</Text>
              </Pressable>
            ) : null}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginBottom: 14,
    ...shadows.subtle,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 },
  reference: { color: colors.muted, fontSize: 12, fontFamily: fonts.sans },
  statusBadge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 11, fontFamily: fonts.sansSemiBold },
  bookTitle: { fontFamily: fonts.sansSemiBold, color: colors.ink, fontSize: 15, marginBottom: 2 },
  seller: { color: colors.muted, fontSize: 12, marginBottom: 8, fontFamily: fonts.sans },
  cardFootRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
  },
  qty: { color: colors.ink, fontFamily: fonts.sans },
  total: { color: colors.maroon800, fontFamily: fonts.sansSemiBold },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  info: { flex: 1, fontSize: 12, color: colors.muted, fontFamily: fonts.sans },
  invoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.maroon800,
  },
  invoiceText: { color: colors.maroon800, fontFamily: fonts.sansSemiBold, fontSize: 12 },
});