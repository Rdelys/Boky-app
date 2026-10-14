import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { Book, fetchBooks, fetchCategories } from '../api/books';
import { parseApiError } from '../api/client';
import { BookCard } from '../components/BookCard';
import { EmptyState } from '../components/EmptyState';
import { colors, fonts, gridColumns, radius, shadows, spacing } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';

const PER_PAGE = 30; // maximum accepté par l'API

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  // Ignore les réponses d'anciennes requêtes (recherche rapide, refresh, etc.)
  const requestId = useRef(0);
  // Verrou synchrone : évite les doubles appels de onEndReached
  const fetchingMore = useRef(false);

  const load = useCallback(
    async (q: string, categorie: string | null, pageNum = 1) => {
      const id = ++requestId.current;
      try {
        setError(null);
        const res = await fetchBooks({
          q,
          categorie: categorie ?? undefined,
          page: pageNum,
          per_page: PER_PAGE,
        });
        if (id !== requestId.current) return;

        setBooks((prev) => {
          if (pageNum === 1) return res.data;
          // Déduplication au cas où un livre est ajouté pendant la navigation
          const known = new Set(prev.map((b) => b.id));
          return [...prev, ...res.data.filter((b) => !known.has(b.id))];
        });
        setPage(res.meta.current_page);
        setLastPage(res.meta.last_page);
      } catch (e) {
        if (id !== requestId.current) return;
        // Une erreur sur la page 1 vide la liste ; sur les suivantes on garde l'existant
        if (pageNum === 1) setBooks([]);
        setError(parseApiError(e).message);
      }
    },
    []
  );

  // Catégories (une seule fois)
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // Chargement initial + recherche / catégorie (avec debounce) : repart de la page 1
  useEffect(() => {
    const isFirst = requestId.current === 0;
    const timeout = setTimeout(
      async () => {
        if (isFirst) setLoading(true);
        fetchingMore.current = false;
        setLoadingMore(false);
        await load(query, activeCategory, 1);
        setLoading(false);
      },
      isFirst ? 0 : 350
    );
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeCategory]);

  const onRefresh = async () => {
    setRefreshing(true);
    fetchingMore.current = false;
    setLoadingMore(false);
    await load(query, activeCategory, 1);
    setRefreshing(false);
  };

  const onEndReached = async () => {
    if (fetchingMore.current || loading || refreshing || error || page >= lastPage) return;
    fetchingMore.current = true;
    setLoadingMore(true);
    await load(query, activeCategory, page + 1);
    fetchingMore.current = false;
    setLoadingMore(false);
  };

  const retryMore = async () => {
    if (fetchingMore.current) return;
    fetchingMore.current = true;
    setLoadingMore(true);
    await load(query, activeCategory, page + 1);
    fetchingMore.current = false;
    setLoadingMore(false);
  };

  const renderFooter = () => {
    if (loadingMore) {
      return <ActivityIndicator style={{ marginVertical: 16 }} color={colors.maroon900} />;
    }
    // Erreur sur une page suivante : bouton "Réessayer"
    if (error && books.length > 0) {
      return (
        <Pressable onPress={retryMore} style={styles.retryBtn}>
          <Ionicons name="refresh" size={14} color={colors.maroon900} />
          <Text style={styles.retryText}>{error}</Text>
        </Pressable>
      );
    }
    return null;
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={[colors.maroon900, colors.maroon700]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
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
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.maroon900} />
      ) : error && books.length === 0 ? (
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.maroon900}
            />
          }
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          renderItem={({ item }) => (
            <BookCard
              book={item}
              onPress={() => navigation.navigate('BookDetail', { id: item.id })}
            />
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
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 16,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignSelf: 'center',
    borderRadius: radius.pill,
    backgroundColor: colors.cream,
    borderWidth: 1,
    borderColor: colors.maroon900,
  },
  retryText: { color: colors.maroon900, fontFamily: fonts.sansMedium, fontSize: 12 },
});