import { LOCALE_PREFIX, LOCALES, type Locale } from './locales';

export const ROUTES = {
  home: '/',
  contact: '/contact',
  versions: '/versions',
  privacy: '/privacy',
  terms: '/terms',
} as const;

export type RouteName = keyof typeof ROUTES;

export interface LocalizedAlternate {
  readonly locale: Locale;
  readonly path: string;
}

export function localizePath(path: string, locale: Locale): string {
  const prefix = LOCALE_PREFIX[locale];
  if (path === ROUTES.home) return prefix === '' ? ROUTES.home : prefix;
  return `${prefix}${path}`;
}

export function alternatesFor(path: string): LocalizedAlternate[] {
  return LOCALES.map((locale) => ({ locale, path: localizePath(path, locale) }));
}

export function anchorOnHome(anchor: string, locale: Locale): string {
  return `${localizePath(ROUTES.home, locale)}#${anchor}`;
}
