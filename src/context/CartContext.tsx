import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book, fetchBook } from '../api/books';

const KEY = 'nhb_cart';

export type CartLine = { book: Book; quantite: number };

type CartValue = {
  lines: CartLine[];
  count: number;
  total: number;
  add: (book: Book, quantite: number) => 'ok' | 'capped';
  setQuantity: (bookId: number, quantite: number) => void;
  remove: (bookId: number) => void;
  clear: () => void;
  refresh: () => Promise<void>;
  isAvailable: (l: CartLine) => boolean;
};

const CartContext = createContext<CartValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setLines(JSON.parse(raw)))
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(lines)).catch(() => {});
  }, [lines, ready]);

  const add: CartValue['add'] = (book, quantite) => {
    let result: 'ok' | 'capped' = 'ok';
    setLines((prev) => {
      const existing = prev.find((l) => l.book.id === book.id);
      const wanted = (existing?.quantite ?? 0) + quantite;
      const final = Math.min(wanted, book.quantite);
      if (final < wanted) result = 'capped';
      return existing
        ? prev.map((l) => (l.book.id === book.id ? { book, quantite: final } : l))
        : [...prev, { book, quantite: final }];
    });
    return result;
  };

  const setQuantity = (bookId: number, quantite: number) =>
    setLines((prev) =>
      prev.map((l) =>
        l.book.id === bookId ? { ...l, quantite: Math.max(1, Math.min(quantite, l.book.quantite || 1)) } : l
      )
    );

  const remove = (bookId: number) => setLines((prev) => prev.filter((l) => l.book.id !== bookId));
  const clear = () => setLines([]);

  // Relit prix/stock côté serveur (comme Cart::lines() sur le site) ; retire les livres supprimés.
  const refresh = useCallback(async () => {
    const current = lines;
    const updated = await Promise.all(
      current.map(async (l) => {
        try {
          return { ...l, book: await fetchBook(l.book.id) };
        } catch (e: any) {
          return e?.response?.status === 404 ? null : l;
        }
      })
    );
    setLines(updated.filter(Boolean) as CartLine[]);
  }, [lines]);

  const isAvailable = (l: CartLine) => l.book.prix_achat != null && l.quantite <= l.book.quantite;

  const value = useMemo<CartValue>(
    () => ({
      lines,
      count: lines.reduce((s, l) => s + l.quantite, 0),
      total: lines.reduce((s, l) => s + (l.book.prix_achat ?? 0) * l.quantite, 0),
      add,
      setQuantity,
      remove,
      clear,
      refresh,
      isAvailable,
    }),
    [lines, refresh]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}