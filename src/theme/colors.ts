/**
 * Palette identique aux variables CSS du site (layouts/app.blade.php :root).
 * Toute modification de couleur doit être faite ici ET sur le site pour
 * rester cohérent.
 */
export const colors = {
  maroon950: '#3d0b15',
  maroon900: '#55101d',
  maroon800: '#6c1524',
  maroon700: '#832032',

  cream: '#f6efdd',
  creamDim: '#e7dcbf',
  ink: '#2a1210',

  green700: '#395e26',
  green500: '#5c8a37',
  green300: '#86b357',

  gold: '#e9b23f',
  goldDim: '#caa056',

  // Couleurs utilitaires reprises des styles du site (statuts, erreurs...)
  danger: '#b3261e',
  dangerBg: 'rgba(179,38,30,.09)',
  successBg: 'rgba(92,138,55,.12)',
  successText: '#395e26',
  muted: '#7a6a5d',
  border: 'rgba(85,16,29,.12)',
  cardBg: '#fffdf7',

  statusEnAttenteBg: 'rgba(233,178,63,.2)',
  statusEnAttenteText: '#8a5f14',
  statusEnLivraisonBg: 'rgba(60,110,200,.14)',
  statusEnLivraisonText: '#2c4f8a',
  statusLivreeBg: 'rgba(92,138,55,.14)',
  statusLivreeText: '#395e26',
  statusAnnuleeBg: 'rgba(179,38,30,.1)',
  statusAnnuleeText: '#b3261e',

  overlay: 'rgba(61,11,21,.55)',
  white: '#ffffff',
};

export const radius = {
  xs: 8,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 26,
  pill: 999,
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 44,
};

export const fonts = {
  // Fraunces (serif, titres) et Inter (sans-serif, texte) comme sur le
  // site. A charger via expo-font — voir App.tsx.
  serif: 'Fraunces_600SemiBold',
  serifRegular: 'Fraunces_400Regular',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
};

/**
 * Ombres cohérentes (iOS: shadow*, Android: elevation) — à spread dans les
 * styles des cartes / boutons flottants pour un rendu moderne homogène.
 */
export const shadows = {
  card: {
    shadowColor: colors.maroon950,
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  floating: {
    shadowColor: colors.maroon950,
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  subtle: {
    shadowColor: colors.maroon950,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
};

export function orderStatusColors(status: string) {
  switch (status) {
    case 'en_attente_livraison':
      return { bg: colors.statusEnAttenteBg, text: colors.statusEnAttenteText };
    case 'en_livraison':
      return { bg: colors.statusEnLivraisonBg, text: colors.statusEnLivraisonText };
    case 'livree':
      return { bg: colors.statusLivreeBg, text: colors.statusLivreeText };
    case 'annulee':
      return { bg: colors.statusAnnuleeBg, text: colors.statusAnnuleeText };
    default:
      return { bg: colors.creamDim, text: colors.ink };
  }
}

/**
 * Nombre de colonnes de la grille catalogue selon la largeur d'écran —
 * couvre petits téléphones, grands téléphones, phablettes et tablettes.
 */
export function gridColumns(width: number) {
  if (width >= 1100) return 5;
  if (width >= 860) return 4;
  if (width >= 560) return 3;
  return 2;
}
