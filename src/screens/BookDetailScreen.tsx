import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Book, fetchBook } from '../api/books';
import { parseApiError } from '../api/client';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { colors, fonts, radius, shadows } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';

function formatAr(n: number) {
  return `${Math.round(n).toLocaleString('fr-FR')} Ar`;
}

/**
 * Fiche livre : affichage + choix de la quantité + "Ajouter au panier".
 * La commande (coordonnées, ville, paiement, facture) se fait dans CartScreen.
 */
export function BookDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { t } = useLocale();
  const { user } = useAuth();
  const { add } = useCart();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [feedback, setFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setBook(await fetchBook(id));
      } catch (e) {
        setError(parseApiError(e).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.maroon900} />
      </View>
    );
  }

  if (!book) {
    return <EmptyState icon="alert-circle-outline" title={error ?? t('common_error_generic')} tone="danger" />;
  }

  const total = (book.prix_achat ?? 0) * quantity;
  const isSellerAccount = !!user && user.role !== 'client';
  const canOrder = !isSellerAccount && book.prix_achat != null && book.en_stock;

  const addToCart = () => {
    const result = add(book, quantity);
    setFeedback(
      result === 'capped'
        ? { text: t('order_error_stock', { quantite: book.quantite }), isError: true }
        : { text: t('cart_added'), isError: false }
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.coverBanner}>
        <Image source={{ uri: book.image_url }} style={styles.coverBg} blurRadius={18} />
        <LinearGradient
          colors={['rgba(61,11,21,.85)', 'rgba(85,16,29,.65)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.coverBannerShade}
        />
        <View style={styles.headerRow}>
          <Image source={{ uri: book.image_url }} style={styles.cover} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{book.titre}</Text>
            {book.seller ? <Text style={styles.seller}>{book.seller.nom}</Text> : null}
            {book.auteur ? <Text style={styles.author}>{book.auteur}</Text> : null}
            <View style={styles.badgeRow}>
              {book.categorie ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{book.categorie}</Text>
                </View>
              ) : null}
              <View style={[styles.badge, styles.badgeGold]}>
                <Text style={styles.badgeText}>{t(`book_condition_${book.etat}`)}</Text>
              </View>
              {book.langue_label ? (
                <View style={[styles.badge, styles.badgeMuted]}>
                  <Text style={styles.badgeText}>{book.langue_label}</Text>
                </View>
              ) : null}
              {book.format_label ? (
                <View style={[styles.badge, styles.badgeMuted]}>
                  <Text style={styles.badgeText}>{book.format_label}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {book.description ? <Text style={styles.description}>{book.description}</Text> : null}

        <View style={styles.summary}>
          <Row label={t('order_unit_price')} value={book.prix_achat != null ? formatAr(book.prix_achat) : '—'} />
          <Row label={t('order_available_label')} value={String(book.quantite)} />
          {book.delai_livraison_label ? (
            <Row label={t('order_delivery_estimate_label')} value={book.delai_livraison_label} />
          ) : null}

          {canOrder && (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{t('order_quantity_label')}</Text>
                <View style={styles.stepper}>
                  <Pressable onPress={() => setQuantity((q) => Math.max(1, q - 1))} style={styles.stepperBtn}>
                    <Ionicons name="remove" size={16} color={colors.maroon800} />
                  </Pressable>
                  <TextInput
                    value={String(quantity)}
                    onChangeText={(v) => {
                      const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
                      setQuantity(Number.isNaN(n) ? 1 : Math.max(1, Math.min(book.quantite, n)));
                    }}
                    keyboardType="number-pad"
                    style={styles.stepperInput}
                  />
                  <Pressable
                    onPress={() => setQuantity((q) => Math.min(book.quantite, q + 1))}
                    style={styles.stepperBtn}
                  >
                    <Ionicons name="add" size={16} color={colors.maroon800} />
                  </Pressable>
                </View>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.summaryLabel}>{t('order_total_label')}</Text>
                <Text style={styles.summaryTotal}>{formatAr(total)}</Text>
              </View>
            </>
          )}
        </View>

        {!book.en_stock ? (
          <EmptyState icon="cube-outline" title={t('books_out_of_stock')} />
        ) : isSellerAccount ? (
          <EmptyState icon="alert-circle-outline" title={t('auth_seller_account_error')} tone="danger" />
        ) : !canOrder ? (
          <EmptyState icon="alert-circle-outline" title={t('order_error_not_for_sale')} tone="danger" />
        ) : (
          <>
            {feedback ? (
              <Text style={[styles.feedback, feedback.isError && styles.feedbackError]}>{feedback.text}</Text>
            ) : null}

            <Button title={t('cart_add_button')} onPress={addToCart} variant="gold" />

            {feedback && !feedback.isError ? (
              <View style={{ marginTop: 10 }}>
                <Button title={t('cart_title')} variant="ghost" onPress={() => navigation.navigate('Cart')} />
              </View>
            ) : null}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  coverBanner: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    overflow: 'hidden',
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  coverBg: { ...StyleSheet.absoluteFillObject, opacity: 0.5 },
  coverBannerShade: { ...StyleSheet.absoluteFillObject },
  headerRow: { flexDirection: 'row', gap: 14 },
  cover: { width: 96, height: 128, borderRadius: 14, backgroundColor: colors.creamDim, ...shadows.floating },
  title: { fontSize: 19, fontFamily: fonts.serif, color: colors.cream, marginBottom: 2 },
  seller: { color: 'rgba(246,239,221,.8)', fontSize: 13, marginBottom: 2, fontFamily: fonts.sans },
  author: { color: 'rgba(246,239,221,.8)', fontSize: 13, marginBottom: 8, fontFamily: fonts.sans },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: { backgroundColor: 'rgba(92,138,55,.4)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  badgeGold: { backgroundColor: 'rgba(233,178,63,.3)' },
  badgeMuted: { backgroundColor: 'rgba(246,239,221,.16)' },
  badgeText: { fontSize: 11, fontFamily: fonts.sansSemiBold, color: colors.cream },
  description: {
    color: colors.ink,
    backgroundColor: colors.cardBg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 16,
    lineHeight: 20,
    fontFamily: fonts.sans,
  },
  summary: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    gap: 10,
    marginBottom: 16,
    ...shadows.subtle,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryTotalRow: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 },
  summaryLabel: { color: colors.ink, fontSize: 13, fontFamily: fonts.sans },
  summaryValue: { color: colors.ink, fontFamily: fonts.sansSemiBold },
  summaryTotal: { color: colors.maroon800, fontFamily: fonts.sansSemiBold, fontSize: 19 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  stepperBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(85,16,29,.06)' },
  stepperInput: { width: 44, textAlign: 'center', fontFamily: fonts.sansSemiBold, color: colors.ink },
  feedback: { textAlign: 'center', color: colors.successText, fontFamily: fonts.sansSemiBold, marginBottom: 10, fontSize: 13 },
  feedbackError: { color: colors.danger },
});