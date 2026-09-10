export const THEME_STORAGE_KEY = 'pseudolearn-theme';

export const THEMES = ['light', 'dark'] as const;

export type Theme = (typeof THEMES)[number];

export function isTheme(candidate: string | null): candidate is Theme {
  return candidate === 'light' || candidate === 'dark';
}

export function resolveTheme(stored: string | null, prefersDark: boolean): Theme {
  if (isTheme(stored)) return stored;
  return prefersDark ? 'dark' : 'light';
}
