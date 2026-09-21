import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { Button } from '../components/Button';
import { LanguageSwitcherChips } from '../components/LanguageSwitcher';
import { colors, fonts, radius, shadows } from '../theme/colors';

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const { t } = useLocale();

  if (!user) return null;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: 16 }}>
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
          <View style={{ flex: 1 }}>
            <InfoRow icon="location-outline" label={t('profile_location')} value={user.profile.localisation} />
            <InfoRow icon="help-circle-outline" label={t('profile_reason')} value={user.profile.motif_inscription} />
            <InfoRow icon="library-outline" label={t('profile_books_wanted')} value={user.profile.types_livres_recherches} />
          </View>
        </View>
      )}

      <Text style={styles.sectionLabel}>Language / Fiteny / Langue</Text>
      <LanguageSwitcherChips />

      <Button title={t('nav_logout')} variant="ghost" onPress={logout} />
    </ScrollView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | null;
}) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIconWrap}>
        <Ionicons name={icon} size={15} color={colors.maroon800} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
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
    ...shadows.subtle,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.maroon950, fontFamily: fonts.sansSemiBold, fontSize: 20 },
  name: { fontSize: 16, fontFamily: fonts.sansSemiBold, color: colors.ink },
  email: { color: colors.muted, fontSize: 13, fontFamily: fonts.sans },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14 },
  infoIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(85,16,29,.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  infoLabel: { fontSize: 11, color: colors.muted, textTransform: 'uppercase', marginBottom: 2, fontFamily: fonts.sansMedium },
  infoValue: { color: colors.ink, fontFamily: fonts.sans },
  sectionLabel: { fontFamily: fonts.sansSemiBold, color: colors.ink, marginBottom: 8 },
});
