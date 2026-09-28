import { describe, expect, it } from 'vitest';
import { SITE } from '@shared/config/site';
import { DOWNLOAD_CARDS } from './download-cards';

describe('DOWNLOAD_CARDS', () => {
  it('contains exactly macOS and mobile download cards', () => {
    expect(DOWNLOAD_CARDS).toHaveLength(2);
    expect(DOWNLOAD_CARDS[0]?.titleKey).toBe('home.downloads.macTitle');
    expect(DOWNLOAD_CARDS[1]?.titleKey).toBe('home.downloads.mobileTitle');
  });

  it('configures macOS download exclusively via Mac App Store', () => {
    const macCard = DOWNLOAD_CARDS[0];
    expect(macCard?.actions).toHaveLength(1);

    const primaryAction = macCard?.actions[0];
    expect(primaryAction?.labelKey).toBe('home.downloads.macPrimary');
    expect(primaryAction?.variant).toBe('pl-btn--primary');
    expect(primaryAction?.href).toBe(SITE.macAppStoreUrl);
    expect(primaryAction?.external).toBe(true);
  });

  it('configures mobile download via App Store', () => {
    const mobileCard = DOWNLOAD_CARDS[1];
    expect(mobileCard?.actions).toHaveLength(1);

    const primaryAction = mobileCard?.actions[0];
    expect(primaryAction?.labelKey).toBe('home.downloads.mobilePrimary');
    expect(primaryAction?.variant).toBe('pl-btn--primary');
    expect(primaryAction?.href).toBe(SITE.iosAppStoreUrl);
    expect(primaryAction?.external).toBe(true);
  });

  it('does not contain any direct dmg action or secondary action for mac', () => {
    const macCard = DOWNLOAD_CARDS[0];
    const actionLabels = macCard?.actions.map((action) => action.labelKey) ?? [];
    expect(actionLabels).toEqual(['home.downloads.macPrimary']);
    expect(actionLabels).not.toContain('home.downloads.macSecondary');
  });

  it('defines valid specs for all cards', () => {
    for (const card of DOWNLOAD_CARDS) {
      expect(card.specs.length).toBeGreaterThan(0);
      for (const spec of card.specs) {
        expect(spec.labelKey).toBeTruthy();
        expect(spec.valueKey).toBeTruthy();
      }
    }
  });
});
