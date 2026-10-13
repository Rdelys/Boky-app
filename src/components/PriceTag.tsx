import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Book } from '../api/books';
import { colors, fonts, radius } from '../theme/colors';

type Props = {
  book: Pick<Book, 'prix_achat' | 'prix_original' | 'en_promo' | 'promo_label'>;
  size?: 'sm' | 'md';
};

function formatAr(n: number) {
  return `${Math.round(n).toLocaleString('fr-FR')} Ar`;
}

/**
 * Prix client avec promotion : ancien prix barré + prix remisé en rouge +
 * badge ("-20%" ou "-1 100 Ar"), comme partials/book-price.blade.php du site.
 */
export function PriceTag({ book, size = 'md' }: Props) {
  if (book.prix_achat == null) {
    return <Text style={[styles.now, size === 'sm' && styles.nowSm]}>—</Text>;
  }

  const promo = !!book.en_promo && book.prix_original != null;

  return (
    <View style={styles.row}>
      {promo ? <Text style={styles.old}>{formatAr(book.prix_original as number)}</Text> : null}
      <Text style={[styles.now, size === 'sm' && styles.nowSm, promo && styles.nowPromo]}>
        {formatAr(book.prix_achat)}
      </Text>
      {promo && book.promo_label ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{book.promo_label}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6 },
  old: {
    color: '#9c8b7d',
    fontFamily: fonts.sans,
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  now: { color: colors.maroon800, fontFamily: fonts.sansSemiBold, fontSize: 16 },
  nowSm: { fontSize: 13 },
  nowPromo: { color: colors.danger },
  badge: {
    backgroundColor: 'rgba(179,38,30,.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: { color: colors.danger, fontFamily: fonts.sansSemiBold, fontSize: 10 },
});