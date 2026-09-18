import { I18n } from 'i18n-js';
import fr from './locales/fr';
import mg from './locales/mg';
import en from './locales/en';

export const SUPPORTED_LOCALES = ['mg', 'fr', 'en'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

// Malgache = langue par défaut du site ("mg" reste la home sans préfixe
// d'URL) : on garde la même valeur par défaut ici.
export const DEFAULT_LOCALE: Locale = 'mg';

export const i18n = new I18n({ fr, mg, en });
i18n.defaultLocale = DEFAULT_LOCALE;
i18n.locale = DEFAULT_LOCALE;
i18n.enableFallback = true;
