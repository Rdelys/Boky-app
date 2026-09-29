import React, { useState } from 'react';
import {
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
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { parseApiError } from '../api/client';
import { Button } from '../components/Button';
import { colors, fonts, radius, shadows, spacing } from '../theme/colors';

/**
 * Onglet "Compte" pour un visiteur non connecté : connexion et inscription
 * réunies dans un même écran, avec des onglets internes (comme le modal du
 * site web). C'est le point d'entrée principal pour se connecter ou créer
 * un compte — plus besoin de passer par un lien caché dans la fiche livre.
 */
export function AuthScreen() {
  const { login, register } = useAuth();
  const { t } = useLocale();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [rEmail, setREmail] = useState('');
  const [rPassword, setRPassword] = useState('');
  const [localisation, setLocalisation] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const switchTab = (next: 'login' | 'register') => {
    setTab(next);
    setError(null);
  };

  const submitLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await login({ email: email.trim(), password });
    } catch (e) {
      setError(parseApiError(e).message);
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      await register({
        prenom: prenom.trim(),
        nom: nom.trim(),
        email: rEmail.trim(),
        password: rPassword,
        localisation: localisation.trim() || undefined,
      });
    } catch (e) {
      setError(parseApiError(e).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        </View>

        <View style={styles.card}>
          <View style={styles.tabs}>
            <Pressable onPress={() => switchTab('login')} style={[styles.tab, tab === 'login' && styles.tabActive]}>
              <Text style={[styles.tabText, tab === 'login' && styles.tabTextActive]}>{t('auth_login_submit')}</Text>
            </Pressable>
            <Pressable onPress={() => switchTab('register')} style={[styles.tab, tab === 'register' && styles.tabActive]}>
              <Text style={[styles.tabText, tab === 'register' && styles.tabTextActive]}>{t('auth_submit_register')}</Text>
            </Pressable>
          </View>

          {tab === 'login' ? (
            <>
              <Text style={styles.subtitle}>{t('auth_login_subtitle')}</Text>

              <Text style={styles.label}>{t('auth_email')}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t('auth_email_placeholder')}
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />

              <Text style={styles.label}>{t('auth_password')}</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={t('auth_password_placeholder')}
                placeholderTextColor={colors.muted}
                secureTextEntry
                style={styles.input}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button title={t('auth_login_submit')} onPress={submitLogin} loading={loading} variant="gold" />
            </>
          ) : (
            <>
              <Text style={styles.subtitle}>{t('auth_client_subtitle')}</Text>

              <View style={styles.row}>
                <View style={styles.half}>
                  <Text style={styles.label}>{t('auth_firstname')}</Text>
                  <TextInput value={prenom} onChangeText={setPrenom} style={styles.input} />
                </View>
                <View style={styles.half}>
                  <Text style={styles.label}>{t('auth_lastname')}</Text>
                  <TextInput value={nom} onChangeText={setNom} style={styles.input} />
                </View>
              </View>

              <Text style={styles.label}>{t('auth_email')}</Text>
              <TextInput
                value={rEmail}
                onChangeText={setREmail}
                placeholder={t('auth_email_placeholder')}
                placeholderTextColor={colors.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />

              <Text style={styles.label}>{t('auth_password')}</Text>
              <TextInput value={rPassword} onChangeText={setRPassword} secureTextEntry style={styles.input} />

              <Text style={styles.label}>{t('auth_location')}</Text>
              <TextInput
                value={localisation}
                onChangeText={setLocalisation}
                placeholder={t('auth_location_placeholder')}
                placeholderTextColor={colors.muted}
                style={styles.input}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button title={t('auth_submit_register')} onPress={submitRegister} loading={loading} variant="gold" />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  logoWrap: { alignItems: 'center', marginBottom: spacing.lg },
  logo: { width: 230, height: 96 },
  card: { backgroundColor: colors.cardBg, borderRadius: radius.xl, padding: 26, ...shadows.floating },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(85,16,29,.06)',
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: 18,
  },
  tab: { flex: 1, paddingVertical: 11, borderRadius: radius.pill, alignItems: 'center' },
  tabActive: { backgroundColor: colors.maroon900, ...shadows.subtle },
  tabText: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.muted },
  tabTextActive: { color: colors.cream },
  subtitle: { textAlign: 'center', color: colors.muted, marginBottom: 16, fontFamily: fonts.sans, fontSize: 13 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  label: { fontFamily: fonts.sansSemiBold, color: colors.ink, marginBottom: 6, fontSize: 13, marginTop: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
    backgroundColor: '#fffdf9',
    fontFamily: fonts.sans,
  },
  error: { color: colors.danger, marginTop: 10, marginBottom: 4, fontSize: 13, fontFamily: fonts.sans },
});