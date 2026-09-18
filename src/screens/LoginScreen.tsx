import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { parseApiError } from '../api/client';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';

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

        <Button title={t('auth_login_submit')} onPress={submit} loading={loading} />

        <Text style={styles.switchText}>
          {t('auth_no_account')}{' '}
          <Text style={styles.switchLink} onPress={() => navigation.navigate('Register')}>
            {t('auth_signup_as_client')}
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: colors.cardBg, borderRadius: 22, padding: 26 },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, textAlign: 'center', marginBottom: 4 },
  subtitle: { textAlign: 'center', color: colors.muted, marginBottom: 20 },
  label: { fontWeight: '600', color: colors.ink, marginBottom: 6, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 14,
    color: colors.ink,
    backgroundColor: '#fffdf9',
  },
  error: { color: colors.danger, marginBottom: 10, fontSize: 13 },
  switchText: { textAlign: 'center', color: colors.muted, marginTop: 16, fontSize: 13 },
  switchLink: { color: colors.maroon800, fontWeight: '700' },
});
