import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { LocaleProvider } from './src/context/LocaleContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';
import { CartProvider } from './src/context/CartContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <LocaleProvider>
        <AuthProvider>
          <CartProvider>
          <StatusBar style="light" backgroundColor={colors.maroon900} />
          <RootNavigator />
          </CartProvider>
        </AuthProvider>
      </LocaleProvider>
    </SafeAreaProvider>
  );
}
