import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Book } from '../api/books';
import { colors, radius } from '../theme/colors';
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

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.coverWrap}>
        <Image source={{ uri: book.image_url }} style={styles.cover} />
        <View style={[styles.tag, book.etat !== 'neuf' && styles.tagUsed]}>
          <Text style={styles.tagText}>{t(`book_condition_${book.etat}`)}</Text>
        </View>
        {!book.en_stock && (
          <View style={styles.outOfStock}>
            <Text style={styles.outOfStockText}>{t('books_out_of_stock')}</Text>
          </View>
        )}
        {book.prix_achat != null && (
          <View style={styles.priceFloat}>
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
        {book.seller ? (
          <Text style={styles.seller} numberOfLines={1}>
            {book.seller.nom}
          </Text>
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
    shadowColor: '#3d0b15',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  pressed: { opacity: 0.9 },
  coverWrap: { aspectRatio: 3 / 4, backgroundColor: colors.creamDim },
  cover: { width: '100%', height: '100%' },
  tag: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(92,138,55,.95)',
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  tagUsed: { backgroundColor: 'rgba(233,178,63,.95)' },
  tagText: { color: colors.cream, fontSize: 10, fontWeight: '700' },
  outOfStock: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(179,38,30,.92)',
    borderRadius: radius.pill,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  outOfStockText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  priceFloat: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    backgroundColor: 'rgba(61,11,21,.6)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  priceFloatText: { color: colors.cream, fontWeight: '700', fontSize: 12 },
  body: { padding: 12 },
  genre: {
    color: colors.green700,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: { color: colors.ink, fontSize: 14, fontWeight: '600', marginBottom: 2 },
  author: { color: colors.muted, fontSize: 12, marginBottom: 4 },
  seller: { color: '#b09c8c', fontSize: 11 },
});
