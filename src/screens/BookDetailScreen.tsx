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
import { Book, fetchBook, fetchPaymentAccounts, PaymentAccount } from '../api/books';
import { placeOrder } from '../api/orders';
import { parseApiError } from '../api/client';
import { Button } from '../components/Button';
import { colors, radius } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';

function formatAr(n: number) {
  return `${Math.round(n).toLocaleString('fr-FR')} Ar`;
}

export function BookDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { t } = useLocale();
  const { user } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);
  const [reference, setReference] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [bookData, accountsData] = await Promise.all([fetchBook(id), fetchPaymentAccounts()]);
        setBook(bookData);
        setAccounts(accountsData);
        setSelectedAccount(accountsData[0] ?? null);
      } catch (e) {
        setSubmitError(parseApiError(e).message);
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
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.danger }}>{submitError ?? t('common_error_generic')}</Text>
      </View>
    );
  }

  const total = (book.prix_achat ?? 0) * quantity;
  const canOrder = !!user && user.role === 'client' && accounts.length > 0 && book.en_stock;

  const submit = async () => {
    if (!book) return;
    if (reference.trim() === '') {
      setSubmitError(t('order_payment_reference_error'));
      return;
    }
    if (!selectedAccount) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const { message } = await placeOrder({
        book_id: book.id,
        quantite: quantity,
        mode_paiement: selectedAccount.key,
        reference_paiement: reference.trim(),
      });
      setSuccess(message);
    } catch (e) {
      setSubmitError(parseApiError(e).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
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
          </View>
        </View>
      </View>

      {book.description ? <Text style={styles.description}>{book.description}</Text> : null}

      <View style={styles.summary}>
        <Row label={t('order_unit_price')} value={book.prix_achat != null ? formatAr(book.prix_achat) : '—'} />
        <Row label={t('order_available_label')} value={String(book.quantite)} />

        {canOrder && !success && (
          <>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('order_quantity_label')}</Text>
              <View style={styles.stepper}>
                <Pressable
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  style={styles.stepperBtn}
                >
                  <Text style={styles.stepperBtnText}>−</Text>
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
                  <Text style={styles.stepperBtnText}>+</Text>
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

      {success ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>{success}</Text>
          <Button title={t('order_history_title')} variant="ghost" onPress={() => navigation.navigate('Orders')} />
        </View>
      ) : !user ? (
        <View style={styles.loginPrompt}>
          <Text style={styles.loginPromptText}>{t('auth_no_account')}</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button title={t('nav_login')} variant="ghost" onPress={() => navigation.navigate('Login')} />
            <Button title={t('auth_signup_as_client')} variant="gold" onPress={() => navigation.navigate('Register')} />
          </View>
        </View>
      ) : accounts.length === 0 ? (
        <Text style={styles.loginPromptText}>{t('order_no_payment_account')}</Text>
      ) : !book.en_stock ? (
        <Text style={styles.loginPromptText}>{t('books_out_of_stock')}</Text>
      ) : (
        <>
          <Text style={styles.sectionLabel}>{t('order_payment_legend')}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {accounts.map((account) => (
              <Pressable
                key={account.key}
                onPress={() => setSelectedAccount(account)}
                style={[
                  styles.paymentChip,
                  selectedAccount?.key === account.key && styles.paymentChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.paymentChipText,
                    selectedAccount?.key === account.key && styles.paymentChipTextActive,
                  ]}
                >
                  {account.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedAccount && (
            <View style={styles.paymentNumberBox}>
              <View>
                <Text style={styles.paymentNumberLabel}>{t('order_payment_number_label')}</Text>
                <Text style={styles.paymentNumberValue}>{selectedAccount.numero}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.paymentNumberLabel}>{t('order_payment_name_label')}</Text>
                <Text style={styles.paymentNumberValue}>{selectedAccount.nom}</Text>
              </View>
            </View>
          )}

          <Text style={styles.sectionLabel}>{t('order_payment_reference_label')}</Text>
          <TextInput
            value={reference}
            onChangeText={(v) => {
              setReference(v);
              setSubmitError(null);
            }}
            placeholder={t('order_payment_reference_placeholder')}
            placeholderTextColor={colors.muted}
            style={[styles.input, !!submitError && styles.inputError]}
          />

          {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

          <Button
            title={t('order_confirm_button')}
            onPress={submit}
            loading={submitting}
            variant="primary"
          />
          <Text style={styles.note}>{t('order_pending_note')}</Text>
        </>
      )}
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
  header: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  cover: { width: 90, height: 118, borderRadius: 10, backgroundColor: colors.creamDim },
  title: { fontSize: 18, fontWeight: '700', color: colors.ink, marginBottom: 2 },
  seller: { color: colors.muted, fontSize: 13, marginBottom: 2 },
  author: { color: colors.muted, fontSize: 13, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  badge: {
    backgroundColor: 'rgba(92,138,55,.1)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeGold: { backgroundColor: 'rgba(233,178,63,.18)' },
  badgeText: { fontSize: 11, fontWeight: '600', color: colors.green700 },
  description: {
    color: colors.ink,
    backgroundColor: 'rgba(85,16,29,.03)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    lineHeight: 20,
  },
  summary: {
    backgroundColor: 'rgba(85,16,29,.04)',
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginBottom: 16,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryTotalRow: { borderTopWidth: 1, borderTopColor: 'rgba(85,16,29,.16)', paddingTop: 10 },
  summaryLabel: { color: colors.ink, fontSize: 13 },
  summaryValue: { color: colors.ink, fontWeight: '600' },
  summaryTotal: { color: colors.maroon800, fontWeight: '700', fontSize: 18 },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  stepperBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(85,16,29,.06)' },
  stepperBtnText: { fontSize: 18, color: colors.maroon800 },
  stepperInput: { width: 44, textAlign: 'center', fontWeight: '600', color: colors.ink },
  sectionLabel: { fontWeight: '700', color: colors.ink, marginBottom: 8, fontSize: 13 },
  paymentChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  paymentChipActive: { borderColor: colors.maroon800, backgroundColor: 'rgba(85,16,29,.06)' },
  paymentChipText: { color: colors.ink, fontWeight: '600', fontSize: 13 },
  paymentChipTextActive: { color: colors.maroon900 },
  paymentNumberBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(233,178,63,.14)',
    borderWidth: 1,
    borderColor: colors.gold,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  paymentNumberLabel: { fontSize: 11, color: colors.muted, marginBottom: 3 },
  paymentNumberValue: { fontWeight: '700', color: colors.maroon900, fontSize: 15 },
  input: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: colors.ink,
    marginBottom: 8,
  },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 12, marginBottom: 10 },
  note: { textAlign: 'center', color: '#9c8b7d', fontSize: 11, marginTop: 10 },
  loginPrompt: { alignItems: 'center', gap: 12, paddingVertical: 12 },
  loginPromptText: { color: colors.muted, textAlign: 'center', marginBottom: 8 },
  successBox: { alignItems: 'center', gap: 12, paddingVertical: 20 },
  successText: { color: colors.successText, fontWeight: '600', textAlign: 'center' },
});
