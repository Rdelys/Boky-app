// src/navigation/RootNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { colors } from '../theme/colors';
import { LoadingScreen } from '../components/LoadingScreen';
import { AppHeaderTitle } from '../components/AppHeaderTitle';
import { LanguageSwitcherNav } from '../components/LanguageSwitcher';
import { GradientHeaderBackground } from '../components/GradientHeaderBackground';
import { AppTabBar } from '../components/AppTabBar';
import { HeaderActions } from '../components/CartButton';

import { BooksScreen } from '../screens/BooksScreen';
import { BookDetailScreen } from '../screens/BookDetailScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { CartScreen } from '../screens/CartScreen';
import { OrdersGate } from '../screens/OrdersGate';
import { AccountScreen } from '../screens/AccountScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Header commun : fond bordeaux en dégradé, sélecteur de langue toujours
// visible en haut à droite — la traduction fonctionne hors-ligne car les
// fichiers de langue sont embarqués dans l'app (src/i18n).
const baseScreenOptions = {
  headerStyle: { backgroundColor: colors.maroon900 },
  headerBackground: () => <GradientHeaderBackground />,
  headerShadowVisible: false,
  headerTintColor: colors.cream,
  headerTitleStyle: { fontWeight: '700' as const },
  headerTitleAlign: 'center' as const,
  headerRight: () => <LanguageSwitcherNav />,
};

// Pile "Livres" : logo seul (pas de titre texte) + icône panier avec badge.
const stackScreenOptions = {
  ...baseScreenOptions,
  headerRight: () => <HeaderActions />,
};

function BooksStack() {
  const { t } = useLocale();
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="BooksList"
        component={BooksScreen}
        options={{ headerTitle: () => <AppHeaderTitle /> }}
      />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: t('cart_title') }} />
      {/* Conservés pour les liens contextuels ("créer un compte" depuis une fiche livre ou le panier) */}
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: t('auth_login_title') }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: t('auth_create_account_title') }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { t } = useLocale();
  return (
    <Tab.Navigator tabBar={(props) => <AppTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Books" component={BooksStack} options={{ title: t('nav_books') }} />
      <Tab.Screen
        name="Orders"
        component={OrdersGate}
        options={{
          title: t('order_history_title'),
          headerShown: true,
          ...baseScreenOptions,
          headerTitle: () => <AppHeaderTitle title={t('order_history_title')} />,
        }}
      />
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{
          title: t('nav_my_profile'),
          headerShown: true,
          ...baseScreenOptions,
          headerTitle: () => <AppHeaderTitle title={t('nav_my_profile')} />,
        }}
      />
    </Tab.Navigator>
  );
}

/**
 * Un seul jeu d'onglets, qu'on soit connecté ou non : "Livres" reste
 * parcourable par tout le monde (comme le site), "Commandes" invite à se
 * connecter si besoin, et "Compte" bascule lui-même entre connexion/
 * inscription et profil selon l'état de la session.
 */
export function RootNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}