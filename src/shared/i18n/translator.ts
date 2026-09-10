import spanish from './es.json';
import english from './en.json';
import { DEFAULT_LOCALE, type Locale } from './locales';

export type TranslationKey = keyof typeof spanish;

export type TranslationValues = Record<string, string | number>;

type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

export type PluralBaseKey = {
  [Key in TranslationKey]: Key extends `${infer Base}.${PluralCategory}` ? Base : never;
}[TranslationKey];

export interface Translator {
  readonly locale: Locale;
  t(key: TranslationKey, values?: TranslationValues): string;
  plural(baseKey: PluralBaseKey, count: number, values?: TranslationValues): string;
  formatNumber(value: number): string;
}

const DICTIONARIES: Record<Locale, Record<string, string>> = {
  es: spanish,
  en: english,
};

const PLACEHOLDER = /\{(\w+)\}/g;

export function interpolate(template: string, values: TranslationValues = {}): string {
  return template.replace(PLACEHOLDER, (match, name: string) =>
    name in values ? String(values[name]) : match,
  );
}

export function createTranslator(locale: Locale): Translator {
  const dictionary = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
  const fallback = DICTIONARIES[DEFAULT_LOCALE];
  const pluralRules = new Intl.PluralRules(locale);
  const numberFormat = new Intl.NumberFormat(locale);

  const lookup = (key: string): string => dictionary[key] ?? fallback[key] ?? key;

  return {
    locale,
    t: (key, values) => interpolate(lookup(key), values),
    plural: (baseKey, count, values) => {
      const category = pluralRules.select(count);
      const template = dictionary[`${baseKey}.${category}`] ?? lookup(`${baseKey}.other`);
      return interpolate(template, { count, ...values });
    },
    formatNumber: (value) => numberFormat.format(value),
  };
}

export function useTranslations(locale: Locale): Translator {
  return createTranslator(locale);
}
