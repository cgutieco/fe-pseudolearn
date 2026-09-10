import { describe, expect, it } from 'vitest';
import {
  DESKTOP_QUERY,
  fallbackDimensions,
  fallbackSource,
  mediaQueryFor,
  preloadMediaQueryFor,
  previewSources,
} from './preview-sources';

describe('mediaQueryFor', () => {
  it('combines breakpoint and colour scheme for the desktop source', () => {
    expect(mediaQueryFor(DESKTOP_QUERY, 'dark')).toBe('(min-width: 900px) and (prefers-color-scheme: dark)');
  });

  it('leaves the mobile source as the unconstrained fallback of the picture', () => {
    expect(mediaQueryFor('all', 'light')).toBe('(prefers-color-scheme: light)');
  });
});

describe('preloadMediaQueryFor', () => {
  it('bounds the mobile preload so it cannot match on a desktop viewport', () => {
    expect(preloadMediaQueryFor('all', 'light')).toBe(
      '(max-width: 899.98px) and (prefers-color-scheme: light)',
    );
  });

  it('keeps the desktop preload on its own breakpoint', () => {
    expect(preloadMediaQueryFor(DESKTOP_QUERY, 'dark')).toBe(
      '(min-width: 900px) and (prefers-color-scheme: dark)',
    );
  });

  it('never lets two preloads match the same viewport and scheme', () => {
    const desktop = preloadMediaQueryFor(DESKTOP_QUERY, 'light');
    const mobile = preloadMediaQueryFor('all', 'light');
    expect(desktop).not.toBe(mobile);
    expect(desktop.includes('min-width') && mobile.includes('max-width')).toBe(true);
  });
});

describe('previewSources', () => {
  it('builds preview sources for Spanish locale', async () => {
    const sources = await previewSources('es');
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.some((source) => source.format === 'avif')).toBe(true);
  });

  it('builds preview sources for English locale', async () => {
    const sources = await previewSources('en');
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.some((source) => source.format === 'avif')).toBe(true);
  });

  it('provides fallbacks for each locale with valid dimensions', async () => {
    const fallbackEs = await fallbackSource('es');
    const fallbackEn = await fallbackSource('en');
    expect(fallbackEs.src).toBeDefined();
    expect(fallbackEn.src).toBeDefined();
    expect(fallbackDimensions('es').width).toBeGreaterThan(0);
    expect(fallbackDimensions('en').width).toBeGreaterThan(0);
  });
});
