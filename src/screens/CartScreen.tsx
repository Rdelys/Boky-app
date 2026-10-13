import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { DeliveryConfig, fetchDeliveryConfig, fetchPaymentAccounts, PaymentAccount } from '../api/books';
import { DeliveryInfo, placeOrder } from '../api/orders';
import { parseApiError } from '../api/client';
import { Button } from '../components/Button';
import { EmptyState } from '../components/EmptyState';
import { PriceTag } from '../components/PriceTag';
import { SelectModal } from '../components/SelectModal';
import { colors, fonts, radius, shadows } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { downloadInvoice } from '../utils/invoice';

const formatAr = (n: number) => `${Math.round(n).toLocaleString('fr-FR')} Ar`;
const AUTRE = 'autre';

type Done = {
  message: string;
  groupe: string;
  invoiceUrl: string | null;
  sousTotal: number;
  totalAPayer: number;
  livraison: DeliveryInfo | null;
};

export function CartScreen({ navigation }: any) {
  const { t } = useLocale();
  const { user } = useAuth();
  const { lines, count, total, economie, setQuantity, remove, clear, refresh, isAvailable } = useCart();

  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [config, setConfig] = useState<DeliveryConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const [selected, setSelected] = useState<PaymentAccount | null>(null);
  const [reference, setReference] = useState('');
  const [address, setAddress] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Livraison
  const [ville, setVille] = useState<string | null>(null);
  const [quartierId, setQuartierId] = useState('');
  const [quartierAutre, setQuartierAutre] = useState('');
  const [coopId, setCoopId] = useState('');
  const [coopAutre, setCoopAutre] = useState('');
  const [livType, setLivType] = useState<'standard' | 'vip'>('standard');
  const [slot, setSlot] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  const lineIds = lines.map((l) => l.book.id).join(',');

  useEffect(() => {
    fetchPaymentAccounts()
      .then((acc) => {
        setAccounts(acc);
        setSelected(acc[0] ?? null);
      })
      .catch((e) => setError(parseApiError(e).message))
      .finally(() => setLoading(false));
  }, []);

  // Config de livraison : dépend des livres du panier (le plus lent décide du délai).
  const loadConfig = useCallback(async () => {
    if (!lineIds) return;
    try {
      const cfg = await fetchDeliveryConfig(lineIds.split(',').map(Number));
      setConfig(cfg);
      // Un créneau VIP périmé est abandonné.
      setSlot((prev) => (cfg.vip.slots.some((s) => s.value === prev) ? prev : ''));
    } catch (e) {
      setError(parseApiError(e).message);
    }
  }, [lineIds]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Prix (promos), stock et créneaux relus à chaque ouverture du panier.
  useFocusEffect(
    useCallback(() => {
      if (!done) {
        refresh();
        loadConfig();
      }
    }, [done, loadConfig]) // eslint-disable-line react-hooks/exhaustive-deps
  );

  /* ============ Aperçu livraison (le serveur recalcule tout) ============ */
  const zone = config?.zones.find((z) => z.nom === ville) ?? null;
  const isCap = !!zone?.capitale;
  const vip = config?.vip ?? null;

  let vipReason = '';
  if (!zone || !isCap) vipReason = t('delivery_vip_only_tana');
  else if (!vip?.enabled) vipReason = t('delivery_vip_off');
  else if (!vip.leadOk) vipReason = t('delivery_vip_unavailable_lead', { hours: vip.maxLeadH });
  else if (!vip.slots.length) vipReason = t('delivery_vip_unavailable_slots');
  const vipOk = !!vip && vipReason === '';
  const isVip = livType === 'vip' && vipOk;

  let fee = 0;
  let tbd = false;
  let pa = false;
  if (zone && config) {
    if (isCap) {
      if (quartierId === AUTRE) tbd = !config.free;
      else fee = zone.quartiers.find((q) => String(q.id) === quartierId)?.frais ?? 0;
    } else {
      fee = zone.frais;
      pa = true;
    }
    if (config.free) fee = 0;
    if (isVip && vip) fee += vip.surcharge;
  }

  const feeText = !zone
    ? '—'
    : fee === 0 && config?.free
    ? t('delivery_fee_free')
    : fee === 0 && tbd
    ? t('delivery_fee_tbd')
    : formatAr(fee) + (tbd ? ` + ${t('delivery_fee_tbd')}` : '');

  const estimateText = !zone ? '—' : isVip && vip ? vip.label : zone.label;

  const notes: string[] = [];
  if (config?.free) notes.push(t('delivery_free_notice'));
  if (isCap && quartierId === AUTRE && !config?.free) notes.push(t('delivery_quartier_other_hint'));
  if (pa) notes.push(t('delivery_coop_pa_note'));

  const canCheckout = lines.length > 0 && lines.every(isAvailable) && (!user || user.role === 'client');
  const isCash = selected?.key === 'especes';

  const chooseVille = (v: string) => {
    setVille(v);
    setQuartierId('');
    setQuartierAutre('');
    setCoopId('');
    setCoopAutre('');
    setSlot('');
    const z = config?.zones.find((x) => x.nom === v);
    if (selected?.key === 'especes' && !z?.capitale) setSelected(accounts[0] ?? null);
  };

  const submit = async () => {
    if (!selected || !ville || !zone) return setError(t('order_city_placeholder'));
    if (!user && (!guestName.trim() || !guestPhone.trim())) return setError(t('order_guest_missing_fields'));
    if (!address.trim()) return setError(t('order_guest_address_label'));

    if (isCap) {
      if (!quartierId || (quartierId === AUTRE && !quartierAutre.trim())) return setError(t('delivery_error_quartier'));
    } else if (!coopId || (coopId === AUTRE && !coopAutre.trim())) {
      return setError(t('delivery_error_coop'));
    }
    if (isVip && !slot) return setError(t('delivery_vip_time_placeholder'));
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
        livraison_type: isVip ? 'vip' : 'standard',
        ...(isCap
          ? { quartier_id: quartierId, ...(quartierId === AUTRE ? { quartier_autre: quartierAutre.trim() } : {}) }
          : { cooperative_id: coopId, ...(coopId === AUTRE ? { cooperative_autre: coopAutre.trim() } : {}) }),
        ...(isVip ? { heure_prevue: slot } : {}),
        ...(!user
          ? { guest_name: guestName.trim(), guest_phone: guestPhone.trim(), guest_email: guestEmail.trim() || undefined }
          : {}),
      });
      clear();
      setDone({
        message: res.message,
        groupe: res.groupe_reference,
        invoiceUrl: res.invoice_url,
        sousTotal: res.sous_total,
        totalAPayer: res.total_a_payer,
        livraison: res.livraison,
      });
      if (res.invoice_url) downloadInvoice(res.invoice_url, res.groupe_reference); // automatique
    } catch (e) {
      setError(parseApiError(e).message);
      refresh(); // stock / prix peuvent avoir changé
      loadConfig(); // créneau VIP peut avoir expiré
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color={colors.maroon900} /></View>;

  if (done) {
    const liv = done.livraison;
    const doneFee = !liv
      ? null
      : liv.frais_gratuit && liv.frais === 0
      ? t('delivery_fee_free')
      : liv.frais_a_confirmer
      ? t('delivery_fee_tbd')
      : formatAr(liv.frais);

    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.doneWrap}>
        <View style={styles.doneIcon}><Ionicons name="checkmark" size={30} color={colors.cream} /></View>
        <Text style={styles.doneTitle}>{t('order_guest_success_title')}</Text>
        <Text style={styles.doneText}>{done.message}</Text>
        <Text style={styles.doneRef}>{done.groupe}</Text>

        <View style={styles.recap}>
          <RecapRow label={t('delivery_subtotal')} value={formatAr(done.sousTotal)} />
          {liv ? (
            <>
              <RecapRow label={`${t('delivery_fee_label')} (${liv.type_label})`} value={doneFee ?? '—'} />
              <RecapRow label={t('delivery_estimate')} value={`${liv.lieu}`} />
            </>
          ) : null}
          <View style={[styles.recapRow, styles.recapTotalRow]}>
            <Text style={styles.recapLabel}>{t('delivery_total_to_pay')}</Text>
            <Text style={styles.recapTotal}>{formatAr(done.totalAPayer)}</Text>
          </View>
        </View>

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

  const villeOptions = (config?.zones ?? []).map((z) => ({ value: z.nom, label: z.nom }));
  const quartierOptions = zone
    ? [
        ...zone.quartiers.map((q) => ({
          value: String(q.id),
          label: config?.free ? q.nom : `${q.nom} — ${formatAr(q.frais)}`,
        })),
        { value: AUTRE, label: t('delivery_quartier_other') },
      ]
    : [];
  const coopOptions = zone
    ? [
        ...zone.cooperatives.map((c) => ({ value: String(c.id), label: c.nom })),
        { value: AUTRE, label: t('delivery_coop_other') },
      ]
    : [];

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
                {l.book.delai_livraison_label ? <Text style={styles.lineSub}>{l.book.delai_livraison_label}</Text> : null}
                <View style={{ alignItems: 'flex-start', marginTop: 2 }}>
                  <PriceTag book={l.book} size="sm" />
                </View>
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
          <Text style={styles.summaryLabel}>{t('delivery_subtotal')}</Text>
          <Text style={styles.summaryValue}>{formatAr(total)}</Text>
        </View>

        {economie > 0 ? (
          <View style={styles.savings}>
            <Text style={styles.savingsText}>{t('cart_savings_label')}</Text>
            <Text style={styles.savingsText}>-{formatAr(economie)}</Text>
          </View>
        ) : null}

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

            {/* ============ LIVRAISON ============ */}
            <Text style={styles.h}>{t('delivery_section_title')}</Text>

            {!config ? (
              <ActivityIndicator color={colors.maroon900} style={{ marginVertical: 14 }} />
            ) : (
              <>
                {config.longDelay ? (
                  <Text style={styles.notice}>
                    {t('delivery_long_notice', { hours: config.standardMaxH, range: config.leadLabel })}
                  </Text>
                ) : null}

                <SelectModal
                  label={t('order_city_label')}
                  placeholder={t('order_city_placeholder')}
                  value={ville}
                  options={villeOptions}
                  onSelect={chooseVille}
                />

                {zone && isCap ? (
                  <>
                    <SelectModal
                      label={t('delivery_quartier_label')}
                      placeholder={t('delivery_quartier_placeholder')}
                      value={quartierId || null}
                      options={quartierOptions}
                      onSelect={setQuartierId}
                    />
                    {quartierId === AUTRE ? (
                      <>
                        <Text style={styles.sectionLabel}>{t('delivery_quartier_other_label')}</Text>
                        <TextInput value={quartierAutre} onChangeText={setQuartierAutre} maxLength={120} style={styles.input} />
                      </>
                    ) : null}
                  </>
                ) : null}

                {zone && !isCap ? (
                  <>
                    <SelectModal
                      label={t('delivery_coop_label')}
                      placeholder={t('delivery_coop_placeholder')}
                      value={coopId || null}
                      options={coopOptions}
                      onSelect={setCoopId}
                    />
                    {coopId === AUTRE ? (
                      <>
                        <Text style={styles.sectionLabel}>{t('delivery_coop_other_label')}</Text>
                        <TextInput value={coopAutre} onChangeText={setCoopAutre} maxLength={120} style={styles.input} />
                      </>
                    ) : null}
                  </>
                ) : null}

                {/* Type de livraison */}
                <Pressable
                  onPress={() => setLivType('standard')}
                  style={[styles.typeCard, !isVip && styles.typeCardActive]}
                >
                  <Text style={styles.typeTitle}>{t('delivery_standard')}</Text>
                  <Text style={styles.typeDesc}>{zone ? zone.label : '—'}</Text>
                </Pressable>

                <Pressable
                  disabled={!vipOk}
                  onPress={() => setLivType('vip')}
                  style={[styles.typeCard, isVip && styles.typeCardActive, !vipOk && styles.typeCardDisabled]}
                >
                  <Text style={styles.typeTitle}>{t('delivery_vip')}</Text>
                  <Text style={styles.typeDesc}>
                    {vipOk && vip
                      ? `${vip.label} · ${t('delivery_vip_precise')} · +${formatAr(vip.surcharge)}`
                      : vipReason}
                  </Text>
                </Pressable>

                {isVip && vip ? (
                  <SelectModal
                    label={t('delivery_vip_time_label')}
                    placeholder={t('delivery_vip_time_placeholder')}
                    value={slot || null}
                    options={vip.slots.map((s) => ({ value: s.value, label: s.label }))}
                    onSelect={setSlot}
                  />
                ) : null}

                {/* Récap prix */}
                <View style={styles.recap}>
                  <RecapRow label={t('delivery_subtotal')} value={formatAr(total)} />
                  <RecapRow label={t('delivery_fee_label')} value={feeText} />
                  <RecapRow label={t('delivery_estimate')} value={estimateText} />
                  {notes.map((n) => (
                    <Text key={n} style={styles.recapNote}>{n}</Text>
                  ))}
                  <View style={[styles.recapRow, styles.recapTotalRow]}>
                    <Text style={styles.recapLabel}>{t('delivery_total_to_pay')}</Text>
                    <Text style={styles.recapTotal}>{formatAr(total + fee)}</Text>
                  </View>
                </View>
              </>
            )}

            {/* ============ PAIEMENT ============ */}
            <Text style={styles.sectionLabel}>{t('order_payment_legend')}</Text>
            <View style={styles.chips}>
              {accounts.map((a) => (
                <Pressable key={a.key} onPress={() => setSelected(a)} style={[styles.chip, selected?.key === a.key && styles.chipActive]}>
                  <Text style={[styles.chipText, selected?.key === a.key && styles.chipTextActive]}>{a.label}</Text>
                </Pressable>
              ))}
              {isCap && (
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

            <Button title={t('order_confirm_button')} onPress={submit} loading={submitting} disabled={!canCheckout || !config} variant="primary" />
            <Text style={styles.note}>{t('order_pending_note')}</Text>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.recapRow}>
      <Text style={styles.recapLabel}>{label}</Text>
      <Text style={styles.recapValue}>{value}</Text>
    </View>
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
  summary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(85,16,29,.04)', borderRadius: radius.md, padding: 16, marginTop: 14, marginBottom: 8 },
  summaryLabel: { fontFamily: fonts.sans, color: colors.ink, fontSize: 15 },
  summaryValue: { fontFamily: fonts.serif, color: colors.maroon800, fontSize: 20 },
  savings: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(179,38,30,.07)', borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 14 },
  savingsText: { color: colors.danger, fontFamily: fonts.sansSemiBold, fontSize: 13 },
  h: { fontFamily: fonts.serif, color: colors.maroon900, fontSize: 18, marginTop: 8, marginBottom: 10 },
  sectionLabel: { fontFamily: fonts.sansSemiBold, color: colors.ink, marginBottom: 8, fontSize: 13, marginTop: 4 },
  input: { backgroundColor: colors.cardBg, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 12, color: colors.ink, marginBottom: 8, fontFamily: fonts.sans },
  notice: { backgroundColor: 'rgba(233,178,63,.14)', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.gold, borderRadius: radius.md, padding: 12, color: '#6b5a4d', fontSize: 12, lineHeight: 18, marginBottom: 12, fontFamily: fonts.sans },
  typeCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: 12, marginBottom: 10, backgroundColor: colors.cardBg },
  typeCardActive: { borderColor: colors.maroon800, backgroundColor: 'rgba(85,16,29,.06)' },
  typeCardDisabled: { opacity: 0.55 },
  typeTitle: { fontFamily: fonts.sansSemiBold, color: colors.ink, fontSize: 14 },
  typeDesc: { fontFamily: fonts.sans, color: colors.muted, fontSize: 12, marginTop: 3 },
  recap: { backgroundColor: 'rgba(85,16,29,.04)', borderRadius: radius.md, padding: 14, gap: 9, marginTop: 4, marginBottom: 14 },
  recapRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  recapLabel: { fontFamily: fonts.sans, color: colors.ink, fontSize: 13, flexShrink: 1 },
  recapValue: { fontFamily: fonts.sansSemiBold, color: colors.ink, fontSize: 13, textAlign: 'right', flexShrink: 1 },
  recapNote: { fontFamily: fonts.sans, color: '#8a7a6d', fontSize: 11, lineHeight: 16 },
  recapTotalRow: { borderTopWidth: 1, borderTopColor: colors.border, borderStyle: 'dashed', paddingTop: 10 },
  recapTotal: { fontFamily: fonts.serif, color: colors.maroon800, fontSize: 20 },
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