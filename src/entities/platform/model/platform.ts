import type { TranslationKey } from '@shared/i18n/translator';
export type PlatformAvailability = 'available' | 'planned';

export interface Platform {
  readonly id: string;
  readonly translationKey: TranslationKey;
  readonly availability: PlatformAvailability;
  readonly minimumVersion?: string;
}

export const PLATFORMS: readonly Platform[] = [
  { id: 'macos', translationKey: 'platform.macos', availability: 'available', minimumVersion: '13+' },
  { id: 'ios', translationKey: 'platform.ios', availability: 'available', minimumVersion: '16+' },
  { id: 'windows', translationKey: 'platform.windows', availability: 'planned' },
  { id: 'linux', translationKey: 'platform.linux', availability: 'planned' },
  { id: 'android', translationKey: 'platform.android', availability: 'planned' },
  { id: 'other', translationKey: 'platform.other', availability: 'planned' },
];

export const REPORTABLE_PLATFORMS: readonly Platform[] = PLATFORMS;

export function availablePlatforms(): readonly Platform[] {
  return PLATFORMS.filter((platform) => platform.availability === 'available');
}

export function plannedPlatforms(): readonly Platform[] {
  return PLATFORMS.filter((platform) => platform.availability === 'planned' && platform.id !== 'other');
}

export function isKnownPlatform(candidate: string): boolean {
  return PLATFORMS.some((platform) => platform.id === candidate);
}
