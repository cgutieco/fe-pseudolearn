import { describe, expect, it } from 'vitest';
import { isTheme, resolveTheme } from './theme-preference';

describe('isTheme', () => {
  it('accepts the two known themes', () => {
    expect(isTheme('light')).toBe(true);
    expect(isTheme('dark')).toBe(true);
  });

  it('rejects anything else', () => {
    expect(isTheme(null)).toBe(false);
    expect(isTheme('sepia')).toBe(false);
  });
});

describe('resolveTheme', () => {
  it('honours an explicit stored choice over the system preference', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('falls back to the system preference when nothing is stored', () => {
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme(null, false)).toBe('light');
  });

  it('ignores a corrupted stored value', () => {
    expect(resolveTheme('bogus', true)).toBe('dark');
  });
});
