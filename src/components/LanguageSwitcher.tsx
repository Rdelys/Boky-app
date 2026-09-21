import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocale } from '../context/LocaleContext';
import { SUPPORTED_LOCALES, Locale } from '../i18n';
import { colors, fonts, radius, shadows, spacing } from '../theme/colors';

const LOCALE_LABEL: Record<Locale, string> = {
  mg: 'Malagasy',
  fr: 'Français',
  en: 'English',
};

/**
 * Bouton compact destiné à la navbar (headerRight). Fonctionne entièrement
 * hors-ligne : les traductions sont embarquées localement (i18n-js +
 * src/i18n/locales/*), aucune requête réseau n'est nécessaire pour changer
 * de langue.
 */
export function LanguageSwitcherNav() {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={10}
        style={({ pressed }) => [styles.navButton, pressed && { opacity: 0.75 }]}
      >
        <Ionicons name="globe-outline" size={16} color={colors.cream} />
        <Text style={styles.navButtonText}>{locale.toUpperCase()}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Language / Fiteny / Langue</Text>
            {SUPPORTED_LOCALES.map((code) => (
              <Pressable
                key={code}
                onPress={() => {
                  setLocale(code);
                  setOpen(false);
                }}
                style={[styles.option, locale === code && styles.optionActive]}
              >
                <Text style={[styles.optionText, locale === code && styles.optionTextActive]}>
                  {LOCALE_LABEL[code]}
                </Text>
                {locale === code ? (
                  <Ionicons name="checkmark-circle" size={18} color={colors.gold} />
                ) : (
                  <View style={{ width: 18 }} />
                )}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

/**
 * Variante pleine largeur en chips, utilisée dans l'écran Profil.
 */
export function LanguageSwitcherChips() {
  const { locale, setLocale } = useLocale();
  return (
    <View style={styles.chipsRow}>
      {SUPPORTED_LOCALES.map((code) => (
        <Pressable
          key={code}
          onPress={() => setLocale(code)}
          style={[styles.chip, locale === code && styles.chipActive]}
        >
          <Text style={[styles.chipText, locale === code && styles.chipTextActive]}>
            {LOCALE_LABEL[code]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,.14)',
    borderRadius: radius.pill,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginRight: spacing.sm,
  },
  navButtonText: {
    color: colors.cream,
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    letterSpacing: 0.4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.floating,
  },
  sheetTitle: {
    fontFamily: fonts.sansSemiBold,
    color: colors.ink,
    fontSize: 13,
    marginBottom: spacing.sm,
    paddingHorizontal: 6,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: radius.md,
  },
  optionActive: { backgroundColor: 'rgba(233,178,63,.14)' },
  optionText: { color: colors.ink, fontFamily: fonts.sansMedium, fontSize: 14 },
  optionTextActive: { color: colors.maroon900, fontFamily: fonts.sansSemiBold },
  chipsRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg, flexWrap: 'wrap' },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: colors.cardBg,
  },
  chipActive: { backgroundColor: colors.maroon900, borderColor: colors.maroon900 },
  chipText: { color: colors.ink, fontFamily: fonts.sansSemiBold, fontSize: 13 },
  chipTextActive: { color: colors.cream },
});
