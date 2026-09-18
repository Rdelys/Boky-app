/**
 * ============================================================
 *  ADRESSE DE L'API — À CHANGER ICI UNIQUEMENT
 * ============================================================
 * Toutes les requêtes de l'app (src/api/*) passent par API_BASE_URL.
 * Pour changer de serveur, deux façons de faire (au choix) :
 *
 * 1) Le plus simple : modifiez directement la valeur ci-dessous.
 *
 * 2) Sans toucher au code : définissez la variable d'environnement
 *    EXPO_PUBLIC_API_URL avant de lancer/builder l'app, par ex. dans un
 *    fichier .env à la racine du projet :
 *
 *        EXPO_PUBLIC_API_URL=https://boky.tafely-test.online
 *
 *    Expo (SDK 49+) injecte automatiquement toute variable préfixée
 *    EXPO_PUBLIC_ dans process.env, sans configuration supplémentaire.
 *    C'est pratique pour avoir une URL différente en dev/staging/prod
 *    (par ex. un fichier .env.production séparé) sans modifier ce fichier.
 * ============================================================
 */

const DEFAULT_API_URL = 'https://boky.tafely-test.online';

export const API_BASE_URL: string =
  (process.env.EXPO_PUBLIC_API_URL && process.env.EXPO_PUBLIC_API_URL.trim() !== ''
    ? process.env.EXPO_PUBLIC_API_URL
    : DEFAULT_API_URL
  ).replace(/\/+$/, ''); // enlève un éventuel "/" final pour éviter "//api"

export const API_URL = `${API_BASE_URL}/api`;
