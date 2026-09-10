import { getImage } from 'astro:assets';
import type { Locale } from '@shared/i18n/locales';

import mobileLightEs from '@assets/product/es/editor-mobile-light.png';
import mobileDarkEs from '@assets/product/es/editor-mobile-dark.png';
import desktopLightEs from '@assets/product/es/editor-desktop-light.png';
import desktopDarkEs from '@assets/product/es/editor-desktop-dark.png';

import mobileLightEn from '@assets/product/en/editor-mobile-light.png';
import mobileDarkEn from '@assets/product/en/editor-mobile-dark.png';
import desktopLightEn from '@assets/product/en/editor-desktop-light.png';
import desktopDarkEn from '@assets/product/en/editor-desktop-dark.png';

export const MOBILE_WIDTHS = [390, 780];
export const DESKTOP_WIDTHS = [1024, 1280, 1600, 1920, 2560];
export const MOBILE_SIZES = 'min(390px, calc(100vw - 32px))';
export const DESKTOP_SIZES = '(min-width: 1100px) min(1248px, calc(100vw - 192px)), calc(100vw - 88px)';
export const FORMATS = ['avif', 'webp'] as const;
export const DESKTOP_QUERY = '(min-width: 900px)';
export const MOBILE_PRELOAD_QUERY = '(max-width: 899.98px)';

export interface PreviewSource {
  readonly format: string;
  readonly query: string;
  readonly scheme: 'light' | 'dark';
  readonly media: string;
  readonly preloadMedia: string;
  readonly srcSet: string;
  readonly sizes: string;
  readonly width: number;
  readonly height: number;
}

interface Variant {
  readonly scheme: 'light' | 'dark';
  readonly query: string;
  readonly source: ImageMetadata;
  readonly widths: number[];
  readonly sizes: string;
}

const VARIANTS_BY_LOCALE: Record<Locale, readonly Variant[]> = {
  es: [
    {
      scheme: 'dark',
      query: DESKTOP_QUERY,
      source: desktopDarkEs,
      widths: DESKTOP_WIDTHS,
      sizes: DESKTOP_SIZES,
    },
    {
      scheme: 'light',
      query: DESKTOP_QUERY,
      source: desktopLightEs,
      widths: DESKTOP_WIDTHS,
      sizes: DESKTOP_SIZES,
    },
    { scheme: 'dark', query: 'all', source: mobileDarkEs, widths: MOBILE_WIDTHS, sizes: MOBILE_SIZES },
    { scheme: 'light', query: 'all', source: mobileLightEs, widths: MOBILE_WIDTHS, sizes: MOBILE_SIZES },
  ],
  en: [
    {
      scheme: 'dark',
      query: DESKTOP_QUERY,
      source: desktopDarkEn,
      widths: DESKTOP_WIDTHS,
      sizes: DESKTOP_SIZES,
    },
    {
      scheme: 'light',
      query: DESKTOP_QUERY,
      source: desktopLightEn,
      widths: DESKTOP_WIDTHS,
      sizes: DESKTOP_SIZES,
    },
    { scheme: 'dark', query: 'all', source: mobileDarkEn, widths: MOBILE_WIDTHS, sizes: MOBILE_SIZES },
    { scheme: 'light', query: 'all', source: mobileLightEn, widths: MOBILE_WIDTHS, sizes: MOBILE_SIZES },
  ],
};

const FALLBACK_SOURCES: Record<Locale, ImageMetadata> = {
  es: mobileLightEs,
  en: mobileLightEn,
};

export function mediaQueryFor(query: string, scheme: string): string {
  const preference = `(prefers-color-scheme: ${scheme})`;
  return query === 'all' ? preference : `${query} and ${preference}`;
}

export function preloadMediaQueryFor(query: string, scheme: string): string {
  const width = query === 'all' ? MOBILE_PRELOAD_QUERY : query;
  return `${width} and (prefers-color-scheme: ${scheme})`;
}

const cached = new Map<Locale, Promise<PreviewSource[]>>();

export function previewSources(locale: Locale = 'es'): Promise<PreviewSource[]> {
  let existing = cached.get(locale);
  if (!existing) {
    existing = buildSources(locale);
    cached.set(locale, existing);
  }
  return existing;
}

async function buildSources(locale: Locale): Promise<PreviewSource[]> {
  const built: PreviewSource[] = [];
  const variants = VARIANTS_BY_LOCALE[locale];
  for (const variant of variants) {
    for (const format of FORMATS) {
      const image = await getImage({
        src: variant.source,
        widths: variant.widths,
        sizes: variant.sizes,
        format,
      });
      built.push({
        format,
        query: variant.query,
        scheme: variant.scheme,
        media: mediaQueryFor(variant.query, variant.scheme),
        preloadMedia: preloadMediaQueryFor(variant.query, variant.scheme),
        srcSet: image.srcSet.attribute,
        sizes: variant.sizes,
        width: variant.source.width,
        height: variant.source.height,
      });
    }
  }
  return built;
}

export function fallbackSource(locale: Locale = 'es') {
  return getImage({
    src: FALLBACK_SOURCES[locale],
    widths: MOBILE_WIDTHS,
    sizes: MOBILE_SIZES,
    format: 'png',
  });
}

export const FALLBACK_DIMENSIONS = { width: mobileLightEs.width, height: mobileLightEs.height };

export function fallbackDimensions(locale: Locale = 'es') {
  const source = FALLBACK_SOURCES[locale];
  return { width: source.width, height: source.height };
}
