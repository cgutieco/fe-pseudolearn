import { describe, expect, it } from 'vitest';
import { shouldOfferOtherLocale } from './language-preference';

describe('shouldOfferOtherLocale', () => {
  it('offers english to an english browser with no stored choice', () => {
    expect(shouldOfferOtherLocale(null, ['en-GB', 'es'], 'en')).toBe(true);
  });

  it('stays silent once the person has chosen a language', () => {
    expect(shouldOfferOtherLocale('es', ['en-GB'], 'en')).toBe(false);
  });

  it('stays silent when the browser does not speak the other language', () => {
    expect(shouldOfferOtherLocale(null, ['es-PE'], 'en')).toBe(false);
  });

  it('handles an empty language list', () => {
    expect(shouldOfferOtherLocale(null, [], 'en')).toBe(false);
  });
});
