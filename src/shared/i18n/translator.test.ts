import { describe, expect, it } from 'vitest';
import { createTranslator, interpolate } from './translator';
import { LOCALES } from './locales';
import spanish from './es.json';
import english from './en.json';

describe('interpolate', () => {
  it('replaces named placeholders', () => {
    expect(interpolate('{used} / {total}', { used: 3, total: 9 })).toBe('3 / 9');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(interpolate('{missing}', {})).toBe('{missing}');
  });

  it('returns the template when there is nothing to replace', () => {
    expect(interpolate('sin marcadores')).toBe('sin marcadores');
  });
});

describe('createTranslator', () => {
  it('resolves a key in every locale', () => {
    for (const locale of LOCALES) {
      expect(createTranslator(locale).t('common.brandName')).toBe('PseudoLearn');
    }
  });

  it('translates the same key differently per locale', () => {
    expect(createTranslator('es').t('nav.contact')).not.toBe(createTranslator('en').t('nav.contact'));
  });

  it('falls back to the key itself when the entry is missing', () => {
    const translate = createTranslator('es').t as (key: string) => string;
    expect(translate('clave.que.no.existe')).toBe('clave.que.no.existe');
  });

  it('selects the singular plural form', () => {
    expect(createTranslator('es').plural('home.track.moduleCount', 1)).toBe('1 módulo');
  });

  it('selects the plural form for zero and for many', () => {
    const translator = createTranslator('es');
    expect(translator.plural('home.track.moduleCount', 0)).toBe('0 módulos');
    expect(translator.plural('home.track.moduleCount', 8)).toBe('8 módulos');
  });

  it('formats numbers with the locale conventions', () => {
    expect(createTranslator('en').formatNumber(1500)).toBe('1,500');
  });
});

describe('dictionaries', () => {
  it('keep identical key sets', () => {
    expect(Object.keys(spanish).sort()).toEqual(Object.keys(english).sort());
  });

  it('have no blank entries', () => {
    const blanks = Object.entries({ ...spanish, ...english }).filter(([, value]) => value.trim() === '');
    expect(blanks).toEqual([]);
  });
});
