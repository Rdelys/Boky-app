import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Book } from '../api/books';
import { colors, fonts, radius, shadows } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';

type Props = {
  book: Book;
  onPress: () => void;
};

function formatAr(n: number) {
  return `${Math.round(n).toLocaleString('fr-FR')} Ar`;
}

export function BookCard({ book, onPress }: Props) {
  const { t } = useLocale();
  const promo = !!book.en_promo && book.prix_original != null;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.coverWrap}>
        <Image source={{ uri: book.image_url }} style={styles.cover} />
        <View style={styles.coverShade} pointerEvents="none" />

        <View style={styles.topRow}>
          <View style={styles.tagsCol}>
            <View style={[styles.tag, book.etat !== 'neuf' && styles.tagUsed]}>
              <Text style={styles.tagText}>{t(`book_condition_${book.etat}`)}</Text>
            </View>
            {promo && book.promo_label ? (
              <View style={styles.promoTag}>
                <Text style={styles.promoTagText}>{book.promo_label}</Text>
              </View>
            ) : null}
          </View>
          {!book.en_stock && (
            <View style={styles.outOfStock}>
              <Text style={styles.outOfStockText}>{t('books_out_of_stock')}</Text>
            </View>
          )}
        </View>

        {book.prix_achat != null && (
          <View style={[styles.priceFloat, promo && styles.priceFloatPromo]}>
            {promo ? <Text style={styles.priceOld}>{formatAr(book.prix_original as number)}</Text> : null}
            <Text style={styles.priceFloatText}>{formatAr(book.prix_achat)}</Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        {book.categorie ? (
          <Text style={styles.genre} numberOfLines={1}>
            {book.categorie}
          </Text>
        ) : null}
        <Text style={styles.title} numberOfLines={2}>
          {book.titre}
        </Text>
        {book.auteur ? (
          <Text style={styles.author} numberOfLines={1}>
            {book.auteur}
          </Text>
        ) : null}

        {book.delai_livraison_label ? (
          <View style={styles.deliveryChip}>
            <Text style={styles.deliveryChipText} numberOfLines={1}>
              {book.delai_livraison_label}
            </Text>
          </View>
        ) : null}

        {(book.langue_label || book.format_label || book.pages_label) && (
          <View style={styles.metaRow}>
            {book.langue_label ? (
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText} numberOfLines={1}>
                  {book.langue_label}
                </Text>
              </View>
            ) : null}
            {book.format_label ? (
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText} numberOfLines={1}>
                  {book.format_label}
                </Text>
              </View>
            ) : null}
            {book.pages_label ? (
              <View style={styles.metaChip}>
                <Text style={styles.metaChipText} numberOfLines={1}>
                  {book.pages_label}
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {book.seller ? (
          <View style={styles.sellerRow}>
            <View style={styles.sellerDot} />
            <Text style={styles.seller} numberOfLines={1}>
              {book.seller.nom}
            </Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    margin: 6,
    ...shadows.card,
  },
  pressed: { opacity: 0.92, transform: [{ scale: 0.99 }] },
  coverWrap: { aspectRatio: 3 / 4, backgroundColor: colors.creamDim },
  cover: { width: '100%', height: '100%' },
  coverShade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '45%',
    backgroundColor: 'rgba(30,7,12,.35)',
  },
  topRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tagsCol: { gap: 6, alignItems: 'flex-start' },
  tag: {
    backgroundColor: 'rgba(92,138,55,.95)',
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  tagUsed: { backgroundColor: 'rgba(233,178,63,.95)' },
  tagText: { color: colors.cream, fontSize: 10, fontFamily: fonts.sansSemiBold },
  promoTag: {
    backgroundColor: '#b3261e',
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  promoTagText: { color: '#fff', fontSize: 10, fontFamily: fonts.sansSemiBold },
  outOfStock: {
    backgroundColor: 'rgba(179,38,30,.92)',
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  outOfStockText: { color: '#fff', fontSize: 10, fontFamily: fonts.sansSemiBold },
  priceFloat: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: 'rgba(61,11,21,.72)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  priceFloatPromo: { backgroundColor: 'rgba(179,38,30,.94)', borderRadius: radius.md },
  priceOld: {
    color: 'rgba(255,255,255,.8)',
    fontFamily: fonts.sans,
    fontSize: 10,
    textDecorationLine: 'line-through',
  },
  priceFloatText: { color: colors.cream, fontFamily: fonts.sansSemiBold, fontSize: 12 },
  body: { padding: 12 },
  genre: {
    color: colors.green700,
    fontSize: 10,
    fontFamily: fonts.sansSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  title: { color: colors.ink, fontSize: 14, fontFamily: fonts.sansSemiBold, marginBottom: 2, lineHeight: 18 },
  author: { color: colors.muted, fontSize: 12, fontFamily: fonts.sans, marginBottom: 6 },
  deliveryChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(92,138,55,.14)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 6,
    maxWidth: '100%',
  },
  deliveryChipText: { color: colors.green700, fontSize: 10, fontFamily: fonts.sansSemiBold },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 6 },
  metaChip: {
    backgroundColor: 'rgba(92,138,55,.1)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  metaChipText: { color: colors.green700, fontSize: 10, fontFamily: fonts.sansMedium },
  sellerRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sellerDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.goldDim },
  seller: { color: '#b09c8c', fontSize: 11, fontFamily: fonts.sans, flexShrink: 1 },
});