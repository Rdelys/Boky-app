import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { Button } from '../components/Button';
import { colors, radius } from '../theme/colors';
import { SUPPORTED_LOCALES } from '../i18n';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { t, locale, setLocale } = useLocale();

  if (!user) return null;

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      {user.profile && (
        <View style={styles.card}>
          <InfoRow label={t('profile_location')} value={user.profile.localisation} />
          <InfoRow label={t('profile_reason')} value={user.profile.motif_inscription} />
          <InfoRow label={t('profile_books_wanted')} value={user.profile.types_livres_recherches} />
        </View>
      )}

      <Text style={styles.sectionLabel}>Language / Fiteny / Langue</Text>
      <View style={styles.localeRow}>
        {SUPPORTED_LOCALES.map((code) => (
          <Pressable
            key={code}
            onPress={() => setLocale(code)}
            style={[styles.localeChip, locale === code && styles.localeChipActive]}
          >
            <Text style={[styles.localeChipText, locale === code && styles.localeChipTextActive]}>
              {code.toUpperCase()}
            </Text>
          </Pressable>
        ))}
      </View>

      <Button title={t('nav_logout')} variant="ghost" onPress={logout} />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '—'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, padding: 16 },
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.maroon950, fontWeight: '700', fontSize: 18 },
  name: { fontSize: 16, fontWeight: '700', color: colors.ink },
  email: { color: colors.muted, fontSize: 13 },
  infoRow: { marginBottom: 10 },
  infoLabel: { fontSize: 11, color: colors.muted, textTransform: 'uppercase', marginBottom: 2 },
  infoValue: { color: colors.ink },
  sectionLabel: { fontWeight: '700', color: colors.ink, marginBottom: 8 },
  localeRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  localeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  localeChipActive: { backgroundColor: colors.maroon900, borderColor: colors.maroon900 },
  localeChipText: { color: colors.ink, fontWeight: '600' },
  localeChipTextActive: { color: colors.cream },
});
