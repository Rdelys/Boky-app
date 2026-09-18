import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { colors } from '../theme/colors';

export function RegisterScreen({ navigation }: any) {
  const { register } = useAuth();
  const { t } = useLocale();

  const [prenom, setPrenom] = useState('');
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localisation, setLocalisation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      await register({
        prenom: prenom.trim(),
        nom: nom.trim(),
        email: email.trim(),
        password,
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
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('auth_create_account_title')}</Text>
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
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <Text style={styles.label}>{t('auth_password')}</Text>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

          <Text style={styles.label}>{t('auth_location')}</Text>
          <TextInput
            value={localisation}
            onChangeText={setLocalisation}
            placeholder={t('auth_location_placeholder')}
            placeholderTextColor={colors.muted}
            style={styles.input}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title={t('auth_submit_register')} onPress={submit} loading={loading} />

          <Text style={styles.switchText}>
            {t('auth_already_account')}{' '}
            <Text style={styles.switchLink} onPress={() => navigation.navigate('Login')}>
              {t('auth_login_link')}
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.cream },
  card: { backgroundColor: colors.cardBg, borderRadius: 22, padding: 26 },
  title: { fontSize: 22, fontWeight: '700', color: colors.ink, textAlign: 'center', marginBottom: 4 },
  subtitle: { textAlign: 'center', color: colors.muted, marginBottom: 20 },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
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
