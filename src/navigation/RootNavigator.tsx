import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { colors } from '../theme/colors';
import { LoadingScreen } from '../components/LoadingScreen';
import { AppHeaderTitle } from '../components/AppHeaderTitle';
import { LanguageSwitcherNav } from '../components/LanguageSwitcher';

import { BooksScreen } from '../screens/BooksScreen';
import { BookDetailScreen } from '../screens/BookDetailScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Header commun : fond bordeaux, titre avec logo, et sélecteur de langue
// toujours visible en haut à droite — la traduction fonctionne hors-ligne
// car les fichiers de langue sont embarqués dans l'app (src/i18n).
const baseScreenOptions = {
  headerStyle: { backgroundColor: colors.maroon900 },
  headerShadowVisible: false,
  headerTintColor: colors.cream,
  headerTitleStyle: { fontWeight: '700' as const },
  headerRight: () => <LanguageSwitcherNav />,
};

function BooksStack() {
  const { t } = useLocale();
  return (
    <Stack.Navigator screenOptions={baseScreenOptions}>
      <Stack.Screen
        name="BooksList"
        component={BooksScreen}
        options={{ headerTitle: () => <AppHeaderTitle title={t('books_heading')} /> }}
      />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: '' }} />
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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.maroon900,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size, focused }) => {
          const icon =
            route.name === 'Books'
              ? focused
                ? 'book'
                : 'book-outline'
              : route.name === 'Orders'
              ? focused
                ? 'receipt'
                : 'receipt-outline'
              : focused
              ? 'person'
              : 'person-outline';
          return <Ionicons name={icon as any} size={size} color={color} />;
        },
      })}
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
 * les écrans Login/Register accessibles depuis la fiche livre.
 */
function BooksAndAuthGate() {
  return <BooksStack />;
}
