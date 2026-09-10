import { describe, expect, it } from 'vitest';
import { ROUTES, alternatesFor, localizePath } from './routes';

describe('localizePath', () => {
  it('keeps the default locale at the root', () => {
    expect(localizePath(ROUTES.home, 'es')).toBe('/');
    expect(localizePath(ROUTES.contact, 'es')).toBe('/contact');
    expect(localizePath(ROUTES.privacy, 'es')).toBe('/privacy');
    expect(localizePath(ROUTES.terms, 'es')).toBe('/terms');
  });

  it('prefixes the secondary locale', () => {
    expect(localizePath(ROUTES.home, 'en')).toBe('/en');
    expect(localizePath(ROUTES.versions, 'en')).toBe('/en/versions');
    expect(localizePath(ROUTES.privacy, 'en')).toBe('/en/privacy');
    expect(localizePath(ROUTES.terms, 'en')).toBe('/en/terms');
  });
});

describe('alternatesFor', () => {
  it('returns one entry per locale', () => {
    expect(alternatesFor(ROUTES.contact)).toEqual([
      { locale: 'es', path: '/contact' },
      { locale: 'en', path: '/en/contact' },
    ]);
  });

  it('never produces duplicate paths', () => {
    const paths = alternatesFor(ROUTES.home).map((entry) => entry.path);
    expect(new Set(paths).size).toBe(paths.length);
  });
});
