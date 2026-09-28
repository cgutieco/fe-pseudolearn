import { SITE } from '@shared/config/site';
import type { TranslationKey } from '@shared/i18n/translator';
import type { IconName } from '@shared/ui/icon';

export interface DownloadAction {
  readonly labelKey: TranslationKey;
  readonly variant: string;
  readonly href?: string;
  readonly external?: boolean;
}

export interface DownloadSpec {
  readonly labelKey: TranslationKey;
  readonly valueKey: TranslationKey;
}

export interface DownloadCardModel {
  readonly icon: IconName;
  readonly titleKey: TranslationKey;
  readonly actions: readonly DownloadAction[];
  readonly specs: readonly DownloadSpec[];
}

export const DOWNLOAD_CARDS: readonly DownloadCardModel[] = [
  {
    icon: 'laptop',
    titleKey: 'home.downloads.macTitle',
    actions: [
      {
        labelKey: 'home.downloads.macPrimary',
        variant: 'pl-btn--primary',
        href: SITE.macAppStoreUrl,
        external: true,
      },
    ],
    specs: [
      { labelKey: 'home.downloads.specRequirements', valueKey: 'home.downloads.macRequirements' },
      { labelKey: 'home.downloads.specArchitecture', valueKey: 'home.downloads.macArchitecture' },
      { labelKey: 'home.downloads.specVersion', valueKey: 'home.downloads.versionValue' },
      { labelKey: 'home.downloads.specPrice', valueKey: 'home.downloads.priceValue' },
    ],
  },
  {
    icon: 'phone',
    titleKey: 'home.downloads.mobileTitle',
    actions: [
      {
        labelKey: 'home.downloads.mobilePrimary',
        variant: 'pl-btn--primary',
        href: SITE.iosAppStoreUrl,
        external: true,
      },
    ],
    specs: [
      { labelKey: 'home.downloads.specRequirements', valueKey: 'home.downloads.mobileRequirements' },
      { labelKey: 'home.downloads.specInput', valueKey: 'home.downloads.mobileInput' },
      { labelKey: 'home.downloads.specVersion', valueKey: 'home.downloads.versionValue' },
      { labelKey: 'home.downloads.specPrice', valueKey: 'home.downloads.priceValue' },
    ],
  },
];
