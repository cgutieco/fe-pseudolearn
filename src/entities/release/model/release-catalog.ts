export interface Release {
  readonly id: string;
  readonly version: string;
  readonly highlights: readonly string[];
}

export const RELEASES = [
  {
    id: '1-0-0',
    version: '1.0.0',
    highlights: ['language', 'execution', 'diagrams', 'projection', 'track', 'files', 'account', 'app'],
  },
] as const satisfies readonly Release[];

export type ReleaseCatalogEntry = (typeof RELEASES)[number];

export function latestRelease(): ReleaseCatalogEntry {
  return RELEASES[0];
}

export function oldestRelease(): ReleaseCatalogEntry {
  return RELEASES[RELEASES.length - 1] ?? RELEASES[0];
}
