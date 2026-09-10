export const LANGUAGE_STORAGE_KEY = 'pseudolearn-language';

export function shouldOfferOtherLocale(
  stored: string | null,
  browserLanguages: readonly string[],
  suggestedLocale: string,
): boolean {
  if (stored !== null) return false;
  return browserLanguages.some((language) => language.toLowerCase().startsWith(suggestedLocale));
}
