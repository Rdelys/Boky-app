import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { fetchOrders, Order } from '../api/orders';
import { parseApiError } from '../api/client';
import { orderStatusColors, colors, radius } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';

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
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.danger, textAlign: 'center', paddingHorizontal: 24 }}>{error}</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.muted }}>{t('order_none_yet')}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={{ padding: 16 }}
      data={orders}
      keyExtractor={(item) => String(item.id)}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      renderItem={({ item }) => {
        const statusColors = orderStatusColors(item.statut);
        return (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.reference}>{item.reference}</Text>
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
            {item.deliverer ? (
              <Text style={styles.deliverer}>
                {t('order_deliverer_label')}: {item.deliverer.nom} — {item.deliverer.telephone}
              </Text>
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
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12,
  },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  reference: { color: colors.muted, fontSize: 12 },
  statusBadge: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 3 },
  statusText: { fontSize: 11, fontWeight: '700' },
  bookTitle: { fontWeight: '700', color: colors.ink, fontSize: 15, marginBottom: 2 },
  seller: { color: colors.muted, fontSize: 12, marginBottom: 8 },
  cardFootRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(85,16,29,.08)',
    paddingTop: 8,
  },
  qty: { color: colors.ink },
  total: { color: colors.maroon800, fontWeight: '700' },
  deliverer: { marginTop: 8, fontSize: 12, color: colors.muted },
});
