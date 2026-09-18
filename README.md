# Ny Herin'ny Boky — App acheteur (Expo / React Native)

Projet Expo prêt à l'emploi : ouvrez le dossier, lancez `npm install`, puis
`npx expo start`. Aucune étape `create-expo-app` nécessaire, tout est déjà
en place (package.json, app.json, babel.config.js, tsconfig.json).

Réservé aux **acheteurs** : inscription/connexion, catalogue des livres,
commande, historique des commandes. Aucune fonction vendeur — ça reste sur
le site web. Mêmes couleurs que le site (`src/theme/colors.ts`) et les
mêmes 3 langues (`mg` par défaut, `fr`, `en`) via `src/i18n`.

## Démarrage

```bash
npm install
npx expo start
```

Puis scannez le QR code avec l'app Expo Go (Android/iOS), ou appuyez sur
`a` / `i` pour un émulateur/simulateur.

## Changer l'adresse de l'API

Une seule ligne à toucher, dans `src/config/env.ts` :

```ts
const DEFAULT_API_URL = 'https://boky.tafely-test.online';
```

Ou, sans toucher au code : copiez `.env.example` en `.env` et changez la
valeur de `EXPO_PUBLIC_API_URL` (Expo lit automatiquement les variables
préfixées `EXPO_PUBLIC_`) :

```bash
cp .env.example .env
# puis éditez .env
```

## Backend requis

Cette app appelle l'API fournie séparément (dossier `laravel-api/` /
messages précédents) : `/api/register`, `/api/login`, `/api/books`,
`/api/orders`, etc. Voir `laravel-api/INSTALLATION.md` pour l'installer
sur le site Laravel (Sanctum + routes + contrôleurs).

## Structure

```
App.tsx
package.json / app.json / babel.config.js / tsconfig.json
src/
  config/env.ts        <- URL de l'API (à changer ici)
  theme/colors.ts        <- palette identique au site
  i18n/                   <- traductions mg / fr / en
  api/                    <- appels HTTP (auth, books, orders)
  context/                <- état global (utilisateur connecté, langue)
  navigation/              <- écrans + onglets
  screens/                 <- Books, BookDetail (commande), Login,
                              Register, Orders, Profile
  components/              <- Button, BookCard
```

## Ce que l'app ne fait PAS (volontairement)

- Pas d'inscription/connexion vendeur.
- Pas d'ajout/édition/suppression de livre.
- Pas de gestion de boutique, de commission ou de paiements reçus.

Tout cela reste réservé à l'espace vendeur du site web.
