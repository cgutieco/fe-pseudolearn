import { describe, expect, it } from 'vitest';
import spanish from '@shared/i18n/es.json';
import english from '@shared/i18n/en.json';
import { RELEASES, latestRelease, oldestRelease, type Release } from './release-catalog';

const SEMANTIC_VERSION = /^\d+\.\d+\.\d+$/;

function missingTranslations(release: Release, dictionary: Record<string, string>): string[] {
  const keys = [
    `versions.release.${release.id}.headline`,
    `versions.release.${release.id}.summary`,
    ...release.highlights.flatMap((highlight) => [
      `versions.release.${release.id}.${highlight}Label`,
      `versions.release.${release.id}.${highlight}Text`,
    ]),
  ];
  return keys.filter((key) => (dictionary[key] ?? '').trim() === '');
}

describe('release catalog', () => {
  it('numbers every release with a semantic version', () => {
    for (const release of RELEASES) {
      expect(release.version).toMatch(SEMANTIC_VERSION);
    }
  });

  it('gives every release a unique identifier and at least one highlight', () => {
    const identifiers = RELEASES.map((release) => release.id);
    expect(new Set(identifiers).size).toBe(identifiers.length);
    for (const release of RELEASES) expect(release.highlights.length).toBeGreaterThan(0);
  });

  it('translates every release into both dictionaries', () => {
    for (const release of RELEASES) {
      expect(missingTranslations(release, spanish)).toEqual([]);
      expect(missingTranslations(release, english)).toEqual([]);
    }
  });

  it('reports the keys a release is missing', () => {
    const undocumented: Release = {
      id: '9-9-9',
      version: '9.9.9',
      highlights: ['telepathy'],
    };
    expect(missingTranslations(undocumented, spanish)).toEqual([
      'versions.release.9-9-9.headline',
      'versions.release.9-9-9.summary',
      'versions.release.9-9-9.telepathyLabel',
      'versions.release.9-9-9.telepathyText',
    ]);
  });

  it('reads the newest release first and the oldest last', () => {
    expect(latestRelease()).toBe(RELEASES[0]);
    expect(oldestRelease()).toBe(RELEASES[RELEASES.length - 1]);
  });
});
