import { describe, expect, it } from 'vitest';
import { PRIVACY_META, PRIVACY_SECTIONS } from './privacy-policy';
import { TERMS_META, TERMS_SECTIONS } from './terms-of-service';

describe('legal-document models', () => {
  it('defines unique section ids in privacy policy', () => {
    const ids = PRIVACY_SECTIONS.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(7);
  });

  it('defines unique section ids in terms of service', () => {
    const ids = TERMS_SECTIONS.map((section) => section.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBe(11);
  });

  it('provides sequential section numbering', () => {
    expect(PRIVACY_SECTIONS[0]?.number).toBe('01');
    expect(PRIVACY_SECTIONS[PRIVACY_SECTIONS.length - 1]?.number).toBe('07');
    expect(TERMS_SECTIONS[0]?.number).toBe('01');
    expect(TERMS_SECTIONS[TERMS_SECTIONS.length - 1]?.number).toBe('11');
  });

  it('contains three pillars in document metadata', () => {
    expect(PRIVACY_META.pillars).toHaveLength(3);
    expect(TERMS_META.pillars).toHaveLength(3);
  });

  it('points sister routes to valid targets', () => {
    expect(PRIVACY_META.sisterRoute).toBe('/terms');
    expect(TERMS_META.sisterRoute).toBe('/privacy');
  });
});
