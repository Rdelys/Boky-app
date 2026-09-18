import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { colors } from '../theme/colors';

import { BooksScreen } from '../screens/BooksScreen';
import { BookDetailScreen } from '../screens/BookDetailScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.maroon900 },
  headerTintColor: colors.cream,
  headerTitleStyle: { fontWeight: '700' as const },
};

function BooksStack() {
  const { t } = useLocale();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="BooksList" component={BooksScreen} options={{ title: t('books_heading') }} />
      <Stack.Screen name="BookDetail" component={BookDetailScreen} options={{ title: '' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: t('auth_login_title') }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: t('auth_create_account_title') }} />
      <Stack.Screen name="Orders" component={OrdersScreen} options={{ title: t('order_history_title') }} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  const { t } = useLocale();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: t('auth_login_title') }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: t('auth_create_account_title') }} />
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
        tabBarIcon: ({ color, size }) => {
          const icon =
            route.name === 'Books' ? 'book-outline' : route.name === 'Orders' ? 'receipt-outline' : 'person-outline';
          return <Ionicons name={icon as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Books" component={BooksStack} options={{ title: t('nav_books') }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: t('order_history_title'), headerShown: true, ...screenOptions }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t('nav_my_profile'), headerShown: true, ...screenOptions }} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream }}>
        <ActivityIndicator color={colors.maroon900} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainTabs /> : <BooksAndAuthGate />}
    </NavigationContainer>
  );
}

/**
 * Un visiteur non connecté peut quand même parcourir le catalogue
 * (comme sur le site) : on lui donne la pile "Livres", qui contient déjà
 * les écrans Login/Register accessibles depuis la fiche livre.
 */
function BooksAndAuthGate() {
  return <BooksStack />;
}
