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
import { APP_NAME } from '../constants/app';

import { BooksScreen } from '../screens/BooksScreen';
import { BookDetailScreen } from '../screens/BookDetailScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { CartScreen } from '../screens/CartScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Header commun : fond bordeaux en dégradé, titre avec logo, et sélecteur de
// langue toujours visible en haut à droite — la traduction fonctionne
// hors-ligne car les fichiers de langue sont embarqués dans l'app (src/i18n).
const baseScreenOptions = {
  headerStyle: { backgroundColor: colors.maroon900 },
  headerBackground: () => <GradientHeaderBackground />,
  headerShadowVisible: false,
  headerTintColor: colors.cream,
  headerTitleStyle: { fontWeight: '700' as const },
  headerRight: () => <LanguageSwitcherNav />,
};

// Pile "Livres" : langue + icône panier (avec badge) dans le header.
// Le panier vit dans cette pile, donc il est accessible aux invités
// comme aux clients connectés.
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
        options={{ headerTitle: () => <AppHeaderTitle title={APP_NAME} /> }}
      />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: t('cart_title') }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: t('auth_login_title') }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: t('auth_create_account_title') }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: t('order_history_title') }} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  const { t } = useLocale();
  return (
    <Tab.Navigator
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Books" component={BooksStack} options={{ title: t('nav_books') }} />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          title: t('order_history_title'),
          headerShown: true,
          ...baseScreenOptions,
          headerTitle: () => <AppHeaderTitle title={t('order_history_title')} showLogo={false} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: t('nav_my_profile'),
          headerShown: true,
          ...baseScreenOptions,
          headerTitle: () => <AppHeaderTitle title={t('nav_my_profile')} showLogo={false} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return <NavigationContainer>{user ? <MainTabs /> : <BooksAndAuthGate />}</NavigationContainer>;
}

/**
 * Un visiteur non connecté peut quand même parcourir le catalogue
 * (comme sur le site) : on lui donne la pile "Livres", qui contient déjà
 * les écrans Login/Register/Cart accessibles depuis la fiche livre et le header.
 */
function BooksAndAuthGate() {
  return <BooksStack />;
}