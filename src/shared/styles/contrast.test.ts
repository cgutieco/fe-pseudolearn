import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const tokens = readFileSync(fileURLToPath(new URL('./tokens.css', import.meta.url)), 'utf8');

const HEX = /--(pl-[a-z0-9-]+):\s*(#[0-9a-f]{3,6})\b/g;

function expandHex(value: string): string {
  if (value.length !== 4) return value;
  const red = value.charAt(1);
  const green = value.charAt(2);
  const blue = value.charAt(3);
  return `#${red}${red}${green}${green}${blue}${blue}`;
}

function readTokens(): Map<string, string> {
  const found = new Map<string, string>();
  for (const match of tokens.matchAll(HEX)) {
    const [, name, value] = match;
    if (name && value) found.set(name, expandHex(value));
  }
  return found;
}

function requireToken(name: string): string {
  const value = palette.get(name);
  if (value === undefined) throw new Error(`Missing colour token: --${name}`);
  return value;
}

function channel(value: number): number {
  const normalised = value / 255;
  return normalised <= 0.03928 ? normalised / 12.92 : ((normalised + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const red = channel(Number.parseInt(hex.slice(1, 3), 16));
  const green = channel(Number.parseInt(hex.slice(3, 5), 16));
  const blue = channel(Number.parseInt(hex.slice(5, 7), 16));
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(foreground: string, background: string): number {
  const first = luminance(foreground);
  const second = luminance(background);
  const lighter = Math.max(first, second);
  const darker = Math.min(first, second);
  return (lighter + 0.05) / (darker + 0.05);
}

const palette = readTokens();

const LIGHT_SURFACES = ['pl-canvas', 'pl-surface', 'pl-sunken', 'pl-raised'];
const LIGHT_TEXT = ['pl-ink', 'pl-ink-2', 'pl-ink-3', 'pl-brand'];
const DARK_SURFACES = ['pl-dark-canvas', 'pl-dark-surface', 'pl-dark-sunken', 'pl-dark-raised'];
const DARK_TEXT = ['pl-dark-ink', 'pl-dark-ink-2', 'pl-dark-ink-3', 'pl-dark-brand'];

const AA_NORMAL_TEXT = 4.5;

describe('token contrast', () => {
  it('reads every colour from the stylesheet', () => {
    for (const name of [...LIGHT_SURFACES, ...LIGHT_TEXT, ...DARK_SURFACES, ...DARK_TEXT]) {
      expect(palette.get(name), name).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  for (const text of LIGHT_TEXT) {
    for (const surface of LIGHT_SURFACES) {
      it(`${text} on ${surface} meets AA for normal text`, () => {
        expect(contrastRatio(requireToken(text), requireToken(surface))).toBeGreaterThanOrEqual(
          AA_NORMAL_TEXT,
        );
      });
    }
  }

  for (const text of DARK_TEXT) {
    for (const surface of DARK_SURFACES) {
      it(`${text} on ${surface} meets AA for normal text`, () => {
        expect(contrastRatio(requireToken(text), requireToken(surface))).toBeGreaterThanOrEqual(
          AA_NORMAL_TEXT,
        );
      });
    }
  }
});
