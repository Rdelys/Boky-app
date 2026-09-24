import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Book, fetchBook, fetchPaymentAccounts, fetchVilles, PaymentAccount } from '../api/books';
import { placeOrder } from '../api/orders';
import { parseApiError } from '../api/client';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { colors, fonts, radius, shadows, spacing } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';

function formatAr(n: number) {
  return `${Math.round(n).toLocaleString('fr-FR')} Ar`;
}

async function downloadInvoice(url: string, reference: string) {
  try {
    const fileUri = `${FileSystem.documentDirectory}${reference}.pdf`;
    const { uri } = await FileSystem.downloadAsync(url, fileUri);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri);
    }
  } catch {
    // Le lien reste consultable manuellement, pas besoin de bloquer l'écran.
  }
}

export function BookDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { t } = useLocale();
  const { user } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [villes, setVilles] = useState<string[]>([]);
  const [villeEspeces, setVilleEspeces] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [selectedAccount, setSelectedAccount] = useState<PaymentAccount | null>(null);
  const [reference, setReference] = useState('');
  const [address, setAddress] = useState('');
  const [ville, setVille] = useState<string | null>(null);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);

  // Champs invité — utilisés uniquement si personne n'est connecté.
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [bookData, accountsData, villesData] = await Promise.all([
          fetchBook(id),
          fetchPaymentAccounts(),
          fetchVilles(),
        ]);
        setBook(bookData);
        setAccounts(accountsData);
        setSelectedAccount(accountsData[0] ?? null);
        setVilles(villesData.data);
        setVilleEspeces(villesData.ville_especes);
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
    return <EmptyState icon="alert-circle-outline" title={submitError ?? t('common_error_generic')} tone="danger" />;
  }

  const total = (book.prix_achat ?? 0) * quantity;
  const isCash = selectedAccount === null && false; // réservé si vous ajoutez "especes" comme option
  // Achat autorisé pour un invité OU un client connecté (jamais un vendeur).
  const canOrder = (!user || user.role === 'client') && accounts.length > 0 && book.en_stock;

  const submit = async () => {
    if (!book || !selectedAccount || !ville) return;

    if (!user && (guestName.trim() === '' || guestPhone.trim() === '')) {
      setSubmitError(t('order_guest_missing_fields') || 'Merci de remplir vos coordonnées.');
      return;
    }
    if (address.trim() === '') {
      setSubmitError(t('order_guest_address_label'));
      return;
    }
    if (selectedAccount.key !== 'especes' && reference.trim() === '') {
      setSubmitError(t('order_payment_reference_error'));
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const { message, invoice_url } = await placeOrder({
        book_id: book.id,
        quantite: quantity,
        mode_paiement: selectedAccount.key,
        reference_paiement: reference.trim(),
        adresse_livraison: address.trim(),
        ville,
        ...(!user
          ? {
              guest_name: guestName.trim(),
              guest_phone: guestPhone.trim(),
              guest_email: guestEmail.trim() || undefined,
            }
          : {}),
      });
      setSuccess(message);
      if (invoice_url) {
        setInvoiceUrl(invoice_url);
        downloadInvoice(invoice_url, book.titre); // téléchargement auto, comme demandé
      }
    } catch (e) {
      setSubmitError(parseApiError(e).message);
    } finally {
      setSubmitting(false);
    }
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
            </View>
          </View>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {book.description ? <Text style={styles.description}>{book.description}</Text> : null}

        <View style={styles.summary}>
          <Row label={t('order_unit_price')} value={book.prix_achat != null ? formatAr(book.prix_achat) : '—'} />
          <Row label={t('order_available_label')} value={String(book.quantite)} />

          {canOrder && !success && (
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
                  <Pressable onPress={() => setQuantity((q) => Math.min(book.quantite, q + 1))} style={styles.stepperBtn}>
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

        {success ? (
          <View style={styles.successBox}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={26} color={colors.cream} />
            </View>
            <Text style={styles.successText}>{success}</Text>
            {invoiceUrl ? (
              <Button
                title={t('order_download_invoice')}
                variant="ghost"
                onPress={() => downloadInvoice(invoiceUrl, book.titre)}
              />
            ) : null}
            {user ? (
              <Button title={t('order_history_title')} variant="ghost" onPress={() => navigation.navigate('Orders')} />
            ) : null}
          </View>
        ) : accounts.length === 0 ? (
          <EmptyState icon="card-outline" title={t('order_no_payment_account')} />
        ) : !book.en_stock ? (
          <EmptyState icon="cube-outline" title={t('books_out_of_stock')} />
        ) : !canOrder ? (
          <EmptyState icon="alert-circle-outline" title={t('auth_seller_account_error')} tone="danger" />
        ) : (
          <>
            {!user && (
              <>
                <Text style={styles.sectionLabel}>{t('order_guest_legend')}</Text>
                <TextInput
                  value={guestName}
                  onChangeText={setGuestName}
                  placeholder={t('order_guest_name_label')}
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                />
                <TextInput
                  value={guestPhone}
                  onChangeText={setGuestPhone}
                  placeholder={t('order_guest_phone_label')}
                  placeholderTextColor={colors.muted}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
                <TextInput
                  value={guestEmail}
                  onChangeText={setGuestEmail}
                  placeholder={t('order_guest_email_placeholder')}
                  placeholderTextColor={colors.muted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
                <Text style={styles.note}>
                  {t('order_guest_account_hint')}{' '}
                  <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
                    {t('order_guest_account_link')}
                  </Text>
                </Text>
              </>
            )}

            <Text style={styles.sectionLabel}>{t('order_guest_address_label')}</Text>
            <TextInput
              value={address}
              onChangeText={setAddress}
              placeholder={t('order_guest_address_placeholder')}
              placeholderTextColor={colors.muted}
              style={styles.input}
            />

            <Text style={styles.sectionLabel}>{t('order_city_label')}</Text>
            <Pressable onPress={() => setCityPickerOpen(true)} style={styles.citySelect}>
              <Text style={ville ? styles.cityValue : styles.cityPlaceholder}>
                {ville ?? t('order_city_placeholder')}
              </Text>
              <Ionicons name="chevron-down" size={16} color={colors.muted} />
            </Pressable>

            <Modal visible={cityPickerOpen} transparent animationType="fade" onRequestClose={() => setCityPickerOpen(false)}>
              <Pressable style={styles.backdrop} onPress={() => setCityPickerOpen(false)}>
                <View style={styles.sheet}>
                  <Text style={styles.sheetTitle}>{t('order_city_label')}</Text>
                  <ScrollView style={{ maxHeight: 320 }}>
                    {villes.map((v) => (
                      <Pressable
                        key={v}
                        onPress={() => {
                          setVille(v);
                          setCityPickerOpen(false);
                        }}
                        style={styles.cityOption}
                      >
                        <Text style={styles.cityOptionText}>{v}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </Pressable>
            </Modal>

            <Text style={styles.sectionLabel}>{t('order_payment_legend')}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {accounts.map((account) => (
                <Pressable
                  key={account.key}
                  onPress={() => setSelectedAccount(account)}
                  style={[styles.paymentChip, selectedAccount?.key === account.key && styles.paymentChipActive]}
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
              {ville === villeEspeces && (
                <Pressable
                  onPress={() => setSelectedAccount({ key: 'especes', label: t('order_payment_cash'), numero: '', nom: '' })}
                  style={[styles.paymentChip, selectedAccount?.key === 'especes' && styles.paymentChipActive]}
                >
                  <Text
                    style={[styles.paymentChipText, selectedAccount?.key === 'especes' && styles.paymentChipTextActive]}
                  >
                    {t('order_payment_cash')}
                  </Text>
                </Pressable>
              )}
            </View>

            {selectedAccount && selectedAccount.key !== 'especes' && (
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

            {selectedAccount && selectedAccount.key !== 'especes' && (
              <>
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
              </>
            )}

            {submitError ? <Text style={styles.errorText}>{submitError}</Text> : null}

            <Button title={t('order_confirm_button')} onPress={submit} loading={submitting} variant="primary" />
            <Text style={styles.note}>{t('order_pending_note')}</Text>
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
  sectionLabel: { fontFamily: fonts.sansSemiBold, color: colors.ink, marginBottom: 8, fontSize: 13, marginTop: 4 },
  paymentChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.cardBg,
  },
  paymentChipActive: { borderColor: colors.maroon800, backgroundColor: 'rgba(85,16,29,.06)' },
  paymentChipText: { color: colors.ink, fontFamily: fonts.sansSemiBold, fontSize: 13 },
  paymentChipTextActive: { color: colors.maroon900 },
  paymentNumberBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(233,178,63,.14)',
    borderWidth: 1,
    borderColor: colors.gold,
    borderStyle: 'dashed',
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 16,
  },
  paymentNumberLabel: { fontSize: 11, color: colors.muted, marginBottom: 3, fontFamily: fonts.sans },
  paymentNumberValue: { fontFamily: fonts.sansSemiBold, color: colors.maroon900, fontSize: 15 },
  input: {
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    marginBottom: 8,
    fontFamily: fonts.sans,
  },
  inputError: { borderColor: colors.danger },
  errorText: { color: colors.danger, fontSize: 12, marginBottom: 10, fontFamily: fonts.sans },
  note: { textAlign: 'center', color: '#9c8b7d', fontSize: 11, marginTop: 10, fontFamily: fonts.sans },
  link: { color: colors.maroon800, fontFamily: fonts.sansSemiBold },
  successBox: { alignItems: 'center', gap: 10, paddingVertical: 20 },
  successIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.green500,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successText: { color: colors.successText, fontFamily: fonts.sansSemiBold, textAlign: 'center' },
  citySelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.cardBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  cityValue: { color: colors.ink, fontFamily: fonts.sans },
  cityPlaceholder: { color: colors.muted, fontFamily: fonts.sans },
  backdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  sheet: { width: '100%', maxWidth: 340, backgroundColor: colors.cardBg, borderRadius: radius.lg, padding: spacing.md, ...shadows.floating },
  sheetTitle: { fontFamily: fonts.sansSemiBold, color: colors.ink, fontSize: 13, marginBottom: spacing.sm, paddingHorizontal: 6 },
  cityOption: { paddingVertical: 12, paddingHorizontal: 10, borderRadius: radius.md },
  cityOptionText: { color: colors.ink, fontFamily: fonts.sansMedium, fontSize: 14 },
});