import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { EmptyState } from '../components/EmptyState';
import { Button } from '../components/Button';
import { colors } from '../theme/colors';
import { OrdersScreen as OrdersList } from './OrdersScreen';

/**
 * L'onglet "Commandes" a besoin d'un compte : un invité n'a pas d'historique
 * consultable (ses commandes ne sont retrouvables que par référence). On
 * évite donc d'appeler l'API sans jeton et on invite à se connecter, avec un
 * raccourci direct vers l'onglet Compte.
 */
export function OrdersGate() {
  const { user } = useAuth();
  const { t } = useLocale();
  const navigation = useNavigation<any>();

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.cream }}>
        <EmptyState icon="receipt-outline" title={t('order_guest_prompt')} />
        <View style={{ paddingHorizontal: 24 }}>
          <Button title={t('auth_login_submit')} variant="gold" onPress={() => navigation.navigate('Account')} />
        </View>
      </View>
    );
  }

  return <OrdersList />;
}