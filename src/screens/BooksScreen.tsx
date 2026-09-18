import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Book, fetchBooks } from '../api/books';
import { parseApiError } from '../api/client';
import { BookCard } from '../components/BookCard';
import { colors, radius } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';

export function BooksScreen({ navigation }: any) {
  const { t } = useLocale();
  const [books, setBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (q: string) => {
    try {
      setError(null);
      const res = await fetchBooks({ q });
      setBooks(res.data);
    } catch (e) {
      setError(parseApiError(e).message);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    load(query).finally(() => setLoading(false));
    // Recherche "à la volée" avec un léger anti-rebond.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      load(query);
    }, 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(query);
    setRefreshing(false);
  };

  return (
    <View style={styles.screen}>
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={t('search_placeholder')}
          placeholderTextColor={colors.muted}
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.maroon900} />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : books.length === 0 ? (
        <Text style={styles.emptyText}>{t('catalog_no_results')}</Text>
      ) : (
        <FlatList
          data={books}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={{ padding: 6 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 6 },
  searchInput: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.ink,
  },
  emptyText: { textAlign: 'center', marginTop: 40, color: colors.muted },
  errorText: { textAlign: 'center', marginTop: 40, color: colors.danger, paddingHorizontal: 24 },
});
