import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Book, fetchBooks, fetchCategories } from '../api/books';
import { parseApiError } from '../api/client';
import { BookCard } from '../components/BookCard';
import { EmptyState } from '../components/EmptyState';
import { colors, fonts, gridColumns, radius, shadows, spacing } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';

export function BooksScreen({ navigation }: any) {
  const { t } = useLocale();
  const { width } = useWindowDimensions();
  const numColumns = gridColumns(width);

  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (q: string, categorie: string | null) => {
    try {
      setError(null);
      const res = await fetchBooks({ q, categorie: categorie ?? undefined });
      setBooks(res.data);
    } catch (e) {
      setError(parseApiError(e).message);
    }
  }, []);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
    setLoading(true);
    load('', null).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      load(query, activeCategory);
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(query, activeCategory);
    setRefreshing(false);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{t('books_heading')}</Text>

        <View style={styles.searchWrap}>
          <Ionicons name="search" size={16} color={colors.muted} style={{ marginRight: 8 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={t('search_placeholder')}
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={colors.muted} />
            </Pressable>
          )}
        </View>

        {categories.length > 0 && (
          <FlatList
            horizontal
            data={['__all__', ...categories]}
            keyExtractor={(item) => item}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
            renderItem={({ item }) => {
              const isAll = item === '__all__';
              const active = isAll ? activeCategory === null : activeCategory === item;
              return (
                <Pressable
                  onPress={() => setActiveCategory(isAll ? null : item)}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                >
                  <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
                    {isAll ? t('catalog_all_categories') : item}
                  </Text>
                </Pressable>
              );
            }}
          />
        )}
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.maroon900} />
      ) : error ? (
        <EmptyState icon="cloud-offline-outline" title={error} tone="danger" />
      ) : books.length === 0 ? (
        <EmptyState icon="book-outline" title={t('catalog_no_results')} />
      ) : (
        <FlatList
          key={numColumns}
          data={books}
          keyExtractor={(item) => String(item.id)}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? { paddingHorizontal: 6 } : undefined}
          contentContainerStyle={{ paddingBottom: 24, paddingTop: 8 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.maroon900} />}
          renderItem={({ item }) => (
            <BookCard book={item} onPress={() => navigation.navigate('BookDetail', { id: item.id })} />
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  hero: {
    backgroundColor: colors.maroon900,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    gap: spacing.sm,
    ...shadows.floating,
  },
  heroTitle: {
    color: colors.cream,
    fontFamily: fonts.serif,
    fontSize: 22,
    marginBottom: 4,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cream,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 11 : 8,
  },
  searchInput: { flex: 1, color: colors.ink, fontFamily: fonts.sans, fontSize: 14 },
  categoryChip: {
    backgroundColor: 'rgba(255,255,255,.12)',
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  categoryChipActive: { backgroundColor: colors.gold },
  categoryChipText: { color: colors.cream, fontFamily: fonts.sansMedium, fontSize: 12 },
  categoryChipTextActive: { color: colors.maroon950, fontFamily: fonts.sansSemiBold },
});
