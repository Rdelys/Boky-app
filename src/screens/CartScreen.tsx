import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { fetchPaymentAccounts, fetchVilles, PaymentAccount } from '../api/books';
import { placeOrder } from '../api/orders';
import { parseApiError } from '../api/client';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { colors, fonts, radius, shadows, spacing } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { downloadInvoice } from '../utils/invoice';

const formatAr = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} Ar`;

export function CartScreen({ navigation }: any) {
  const { t } = useLocale();
  const { user } = useAuth();
  const { lines, count, total, setQuantity, remove, clear, refresh, isAvailable } = useCart();

  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [villes, setVilles] = useState<string[]>([]);
  const [villeEspeces, setVilleEspeces] = useState('');
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<PaymentAccount | null>(null);
  const [reference, setReference] = useState('');
  const [address, setAddress] = useState('');
  const [ville, setVille] = useState<string | null>(null);
  const [cityOpen, setCityOpen] = useState(false);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ message: string; groupe: string; invoiceUrl: string | null } | null>(null);

  useEffect(() => {
    Promise.all([fetchPaymentAccounts(), fetchVilles()])
      .then(([acc, v]) => {
        setAccounts(acc);
        setSelected(acc[0] ?? null);
        setVilles(v.data);
        setVilleEspeces(v.ville_especes);
      })
      .catch((e) => setError(parseApiError(e).message))
      .finally(() => setLoading(false));
  }, []);

  // Prix et stock relus à chaque ouverture du panier.
  useFocusEffect(useCallback(() => { if (!done) refresh(); }, [done])); // eslint-disable-line

  const canCheckout = lines.length > 0 && lines.every(isAvailable) && (!user || user.role === 'client');
  const cashAllowed = ville !== null && ville === villeEspeces;
  const isCash = selected?.key === 'especes';

  const chooseVille = (v: string) => {
    setVille(v);
    setCityOpen(false);
    if (selected?.key === 'especes' && v !== villeEspeces) setSelected(accounts[0] ?? null);
  };

  const submit = async () => {
    if (!selected || !ville) return setError(t('order_city_placeholder'));
    if (!user && (!guestName.trim() || !guestPhone.trim())) return setError(t('order_guest_missing_fields'));
    if (!address.trim()) return setError(t('order_guest_address_label'));
    if (!isCash && !reference.trim()) return setError(t('order_payment_reference_error'));

    setSubmitting(true);
    setError(null);
    try {
      const res = await placeOrder({
        items: lines.map((l) => ({ book_id: l.book.id, quantite: l.quantite })),
        mode_paiement: selected.key,
        reference_paiement: reference.trim(),
        adresse_livraison: address.trim(),
        ville,
        ...(!user ? { guest_name: guestName.trim(), guest_phone: guestPhone.trim(), guest_email: guestEmail.trim() || undefined } : {}),
      });
      clear();
      setDone({ message: res.message, groupe: res.groupe_reference, invoiceUrl: res.invoice_url });
      if (res.invoice_url) downloadInvoice(res.invoice_url, res.groupe_reference); // automatique
    } catch (e) {
      setError(parseApiError(e).message);
      refresh(); // stock peut avoir changé
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.maroon900} /></View>;

  if (done) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.doneWrap}>
        <View style={styles.doneIcon}><Ionicons name="checkmark" size={30} color={colors.cream} /></View>
        <Text style={styles.doneTitle}>{t('order_guest_success_title')}</Text>
        <Text style={styles.doneText}>{done.message}</Text>
        <Text style={styles.doneRef}>{done.groupe}</Text>
        {done.invoiceUrl ? (
          <Button title={t('order_download_invoice')} variant="gold" onPress={() => downloadInvoice(done.invoiceUrl!, done.groupe)} />
        ) : null}
        <View style={{ height: 10 }} />
        {user ? (
          <Button title={t('order_history_title')} variant="ghost" onPress={() => navigation.navigate('Orders')} />
        ) : (
          <Text style={styles.note}>{t('order_guest_success_hint')}</Text>
        )}
        <View style={{ height: 10 }} />
        <Button title={t('cart_browse')} variant="ghost" onPress={() => navigation.navigate('BooksList')} />
      </ScrollView>
    );
  }

  if (lines.length === 0) {
    return (
      <View style={styles.screen}>
        <EmptyState icon="cart-outline" title={t('cart_empty')} />
        <View style={{ padding: 24 }}>
          <Button title={t('cart_browse')} variant="ghost" onPress={() => navigation.navigate('BooksList')} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.count}>{t('cart_items_count', { count })}</Text>

        {lines.map((l) => {
          const ok = isAvailable(l);
          return (
            <View key={l.book.id} style={[styles.line, !ok && styles.lineBad]}>
              <Image source={{ uri: l.book.image_url }} style={styles.thumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.lineTitle} numberOfLines={2}>{l.book.titre}</Text>
                {l.book.seller ? <Text style={styles.lineSub}>{l.book.seller.nom}</Text> : null}
                <Text style={styles.lineSub}>{formatAr(l.book.prix_achat ?? 0)}</Text>
                {!ok && <Text style={styles.lineError}>{t('order_error_stock', { quantite: l.book.quantite })}</Text>}
                <View style={styles.lineFoot}>
                  <View style={styles.stepper}>
                    <Pressable onPress={() => setQuantity(l.book.id, l.quantite - 1)} style={styles.stepBtn}><Ionicons name="remove" size={14} color={colors.maroon800} /></Pressable>
                    <Text style={styles.stepVal}>{l.quantite}</Text>
                    <Pressable onPress={() => setQuantity(l.book.id, l.quantite + 1)} style={styles.stepBtn}><Ionicons name="add" size={14} color={colors.maroon800} /></Pressable>
                  </View>
                  <Text style={styles.lineTotal}>{formatAr((l.book.prix_achat ?? 0) * l.quantite)}</Text>
                  <Pressable onPress={() => remove(l.book.id)} hitSlop={8}>
                    <Text style={styles.remove}>{t('cart_remove')}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}

        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>{t('order_total_label')}</Text>
          <Text style={styles.summaryValue}>{formatAr(total)}</Text>
        </View>

        <Text style={styles.h}>{t('cart_checkout_title')}</Text>

        {accounts.length === 0 ? (
          <Text style={styles.note}>{t('order_no_payment_account')}</Text>
        ) : (
          <>
            {!user && (
              <>
                <Text style={styles.sectionLabel}>{t('order_guest_legend')}</Text>
                <TextInput value={guestName} onChangeText={setGuestName} placeholder={t('order_guest_name_label')} placeholderTextColor={colors.muted} style={styles.input} />
                <TextInput value={guestPhone} onChangeText={setGuestPhone} placeholder={t('order_guest_phone_label')} placeholderTextColor={colors.muted} keyboardType="phone-pad" style={styles.input} />
                <TextInput value={guestEmail} onChangeText={setGuestEmail} placeholder={t('order_guest_email_label')} placeholderTextColor={colors.muted} keyboardType="email-address" autoCapitalize="none" style={styles.input} />
                <Text style={styles.note}>
                  {t('order_guest_account_hint')}{' '}
                  <Text style={styles.link} onPress={() => navigation.navigate('Register')}>{t('order_guest_account_link')}</Text>
                </Text>
              </>
            )}

            <Text style={styles.sectionLabel}>{t('order_guest_address_label')}</Text>
            <TextInput value={address} onChangeText={setAddress} placeholder={t('order_guest_address_placeholder')} placeholderTextColor={colors.muted} style={styles.input} />

            <Text style={styles.sectionLabel}>{t('order_city_label')}</Text>
            <Pressable onPress={() => setCityOpen(true)} style={styles.citySelect}>
              <Text style={ville ? styles.cityValue : styles.cityPlaceholder}>{ville ?? t('order_city_placeholder')}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.muted} />
            </Pressable>

            <Modal visible={cityOpen} transparent animationType="fade" onRequestClose={() => setCityOpen(false)}>
              <Pressable style={styles.backdrop} onPress={() => setCityOpen(false)}>
                <View style={styles.sheet}>
                  <Text style={styles.sheetTitle}>{t('order_city_label')}</Text>
                  <ScrollView style={{ maxHeight: 320 }}>
                    {villes.map((v) => (
                      <Pressable key={v} onPress={() => chooseVille(v)} style={styles.cityOption}>
                        <Text style={styles.cityOptionText}>{v}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </Pressable>
            </Modal>

            <Text style={styles.sectionLabel}>{t('order_payment_legend')}</Text>
            <View style={styles.chips}>
              {accounts.map((a) => (
                <Pressable key={a.key} onPress={() => setSelected(a)} style={[styles.chip, selected?.key === a.key && styles.chipActive]}>
                  <Text style={[styles.chipText, selected?.key === a.key && styles.chipTextActive]}>{a.label}</Text>
                </Pressable>
              ))}
              {cashAllowed && (
                <Pressable onPress={() => setSelected({ key: 'especes', label: t('order_payment_cash'), numero: '', nom: '' })} style={[styles.chip, isCash && styles.chipActive]}>
                  <Text style={[styles.chipText, isCash && styles.chipTextActive]}>{t('order_payment_cash')}</Text>
                </Pressable>
              )}
            </View>

            {selected && !isCash && (
              <>
                <View style={styles.payBox}>
                  <View>
                    <Text style={styles.payLabel}>{t('order_payment_number_label')}</Text>
                    <Text style={styles.payValue}>{selected.numero}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.payLabel}>{t('order_payment_name_label')}</Text>
                    <Text style={styles.payValue}>{selected.nom}</Text>
                  </View>
                </View>
                <Text style={styles.sectionLabel}>{t('order_payment_reference_label')}</Text>
                <TextInput value={reference} onChangeText={(v) => { setReference(v); setError(null); }} placeholder={t('order_payment_reference_placeholder')} placeholderTextColor={colors.muted} style={styles.input} />
              </>
            )}

            {!canCheckout && lines.some((l) => !isAvailable(l)) ? <Text style={styles.errorText}>{t('cart_unavailable')}</Text> : null}
            {user && user.role !== 'client' ? <Text style={styles.errorText}>{t('auth_seller_account_error')}</Text> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <Button title={t('order_confirm_button')} onPress={submit} loading={submitting} disabled={!canCheckout} variant="primary" />
            <Text style={styles.note}>{t('order_pending_note')}</Text>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream },
  count: { color: colors.muted, fontFamily: fonts.sans, marginBottom: 10 },
  line: { flexDirection: 'row', gap: 12, backgroundColor: colors.cardBg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: 12, marginBottom: 10, ...shadows.subtle },
  lineBad: { borderColor: 'rgba(179,38,30,.35)', backgroundColor: colors.dangerBg },
  thumb: { width: 56, height: 74, borderRadius: 10, backgroundColor: colors.creamDim },
  lineTitle: { fontFamily: fonts.serif, color: colors.ink, fontSize: 15 },
  lineSub: { color: colors.muted, fontSize: 12, fontFamily: fonts.sans },
  lineError: { color: colors.danger, fontSize: 12, marginTop: 2, fontFamily: fonts.sans },
  lineFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 8 },
  stepper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, overflow: 'hidden' },
  stepBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(85,16,29,.06)' },
  stepVal: { width: 30, textAlign: 'center', fontFamily: fonts.sansSemiBold, color: colors.ink },
  lineTotal: { fontFamily: fonts.sansSemiBold, color: colors.maroon800 },
  remove: { color: colors.danger, fontFamily: fonts.sansSemiBold, fontSize: 12 },
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(85,16,29,.04)', borderRadius: radius.md, padding: 16, marginVertical: 14 },
  summaryLabel: { fontFamily: fonts.sans, color: colors.ink, fontSize: 15 },
  summaryValue: { fontFamily: fonts.serif, color: colors.maroon800, fontSize: 20 },
  h: { fontFamily: fonts.serif, color: colors.maroon900, fontSize: 18, marginBottom: 10 },
  sectionLabel: { fontFamily: fonts.sansSemiBold, color: colors.ink, marginBottom: 8, fontSize: 13, marginTop: 4 },
  input: { backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, color: colors.ink, marginBottom: 8, fontFamily: fonts.sans },
  citySelect: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12 },
  cityValue: { color: colors.ink, fontFamily: fonts.sans },
  cityPlaceholder: { color: colors.muted, fontFamily: fonts.sans },
  backdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  sheet: { width: '100%', maxWidth: 340, backgroundColor: colors.cardBg, borderRadius: radius.lg, padding: spacing.md, ...shadows.floating },
  sheetTitle: { fontFamily: fonts.sansSemiBold, color: colors.ink, fontSize: 13, marginBottom: spacing.sm, paddingHorizontal: 6 },
  cityOption: { paddingVertical: 12, paddingHorizontal: 10, borderRadius: radius.md },
  cityOptionText: { color: colors.ink, fontFamily: fonts.sansMedium, fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: colors.cardBg },
  chipActive: { borderColor: colors.maroon800, backgroundColor: 'rgba(85,16,29,.06)' },
  chipText: { color: colors.ink, fontFamily: fonts.sansSemiBold, fontSize: 13 },
  chipTextActive: { color: colors.maroon900 },
  payBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: 'rgba(233,178,63,.14)', borderWidth: 1, borderColor: colors.gold, borderStyle: 'dashed', borderRadius: radius.md, padding: 14, marginBottom: 12 },
  payLabel: { fontSize: 11, color: colors.muted, marginBottom: 3, fontFamily: fonts.sans },
  payValue: { fontFamily: fonts.sansSemiBold, color: colors.maroon900, fontSize: 15 },
  errorText: { color: colors.danger, fontSize: 12, marginBottom: 10, fontFamily: fonts.sans },
  note: { textAlign: 'center', color: '#9c8b7d', fontSize: 11, marginTop: 10, fontFamily: fonts.sans },
  link: { color: colors.maroon800, fontFamily: fonts.sansSemiBold },
  doneWrap: { alignItems: 'stretch', padding: 24, paddingTop: 40 },
  doneIcon: { alignSelf: 'center', width: 60, height: 60, borderRadius: 30, backgroundColor: colors.green500, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  doneTitle: { textAlign: 'center', fontFamily: fonts.serif, fontSize: 22, color: colors.ink, marginBottom: 8 },
  doneText: { textAlign: 'center', color: colors.muted, fontFamily: fonts.sans, marginBottom: 10 },
  doneRef: { alignSelf: 'center', fontFamily: fonts.serif, fontSize: 18, color: colors.maroon800, backgroundColor: 'rgba(233,178,63,.14)', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, borderRadius: radius.md, paddingHorizontal: 18, paddingVertical: 10, marginBottom: 18 },
});