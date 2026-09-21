import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { parseApiError } from '../api/client';
import { Button } from '../components/Button';
import { colors, fonts, radius, shadows, spacing } from '../theme/colors';
import { APP_NAME } from '../constants/app';

export function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
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

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={[colors.maroon950, colors.maroon800]} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>{APP_NAME}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{t('auth_login_title')}</Text>
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

          <Button title={t('auth_login_submit')} onPress={submit} loading={loading} variant="gold" />

          <Text style={styles.switchText}>
            {t('auth_no_account')}{' '}
            <Text style={styles.switchLink} onPress={() => navigation.navigate('Register')}>
              {t('auth_signup_as_client')}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.maroon950 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: spacing.lg },
  logoWrap: { alignItems: 'center', marginBottom: spacing.lg, gap: 10 },
  logo: { width: 76, height: 76 },
  appName: { color: colors.cream, fontFamily: fonts.serif, fontSize: 18, textAlign: 'center' },
  card: { backgroundColor: colors.cardBg, borderRadius: radius.xl, padding: 26, ...shadows.floating },
  title: { fontSize: 22, fontFamily: fonts.serif, color: colors.ink, textAlign: 'center', marginBottom: 4 },
  subtitle: { textAlign: 'center', color: colors.muted, marginBottom: 22, fontFamily: fonts.sans },
  label: { fontFamily: fonts.sansSemiBold, color: colors.ink, marginBottom: 6, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    color: colors.ink,
    backgroundColor: '#fffdf9',
    fontFamily: fonts.sans,
  },
  error: { color: colors.danger, marginBottom: 10, fontSize: 13, fontFamily: fonts.sans },
  switchText: { textAlign: 'center', color: colors.muted, marginTop: 18, fontSize: 13, fontFamily: fonts.sans },
  switchLink: { color: colors.maroon800, fontFamily: fonts.sansSemiBold },
});
