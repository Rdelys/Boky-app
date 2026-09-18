/**
 * ============================================================
 *  STOCKAGE SÉCURISÉ MULTIPLATEFORME
 * ============================================================
 * `expo-secure-store` ne fonctionne QUE sur iOS et Android : son
 * implémentation web (ExpoSecureStore.web.js) exporte un objet vide,
 * d'où l'erreur "getValueWithKeyAsync is not a function" dans le
 * navigateur.
 *
 * Ce module expose la même API (getItemAsync / setItemAsync /
 * deleteItemAsync) mais choisit le backend selon la plateforme :
 *
 *  - NATIF (iOS/Android) : expo-secure-store → Keychain / Keystore,
 *    le token est chiffré par le système.
 *  - WEB : localStorage (via AsyncStorage qui l'utilise en interne).
 *    ⚠️ Sur le web, localStorage n'est PAS chiffré : c'est le
 *    compromis habituel pour une app web. Le token reste protégé
 *    par la politique same-origin du navigateur.
 * ============================================================
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import statique : Metro remplace l'implémentation web par un objet vide,
// on ne l'appelle donc jamais quand Platform.OS === 'web'.
import * as SecureStore from 'expo-secure-store';

const isWeb = Platform.OS === 'web';

export async function getItemAsync(key: string): Promise<string | null> {
  try {
    if (isWeb) {
      return await AsyncStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  } catch {
    // Un stockage illisible (valeur corrompue, quota, mode privé…)
    // ne doit jamais faire planter l'app : on repart de zéro.
    return null;
  }
}

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (isWeb) {
    await AsyncStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
  try {
    if (isWeb) {
      await AsyncStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Suppression idempotente : une clé absente n'est pas une erreur.
  }
}
