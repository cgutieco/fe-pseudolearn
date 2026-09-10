export const LOCALES = ['es', 'en'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'es';

export const LOCALE_PREFIX: Record<Locale, string> = {
  es: '',
  en: '/en',
};

export const HTML_LANG: Record<Locale, string> = {
  es: 'es',
  en: 'en',
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'es' ? 'en' : 'es';
}
