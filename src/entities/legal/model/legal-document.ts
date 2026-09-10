import type { TranslationKey } from '@shared/i18n/translator';

export interface LegalPillar {
  readonly titleKey: TranslationKey;
  readonly textKey: TranslationKey;
}

export interface LegalCard {
  readonly titleKey: TranslationKey;
  readonly textKey: TranslationKey;
}

export interface LegalCalloutData {
  readonly titleKey: TranslationKey;
  readonly textKey: TranslationKey;
}

export interface LegalSection {
  readonly id: string;
  readonly number: string;
  readonly titleKey: TranslationKey;
  readonly leadKey: TranslationKey;
  readonly bodyKeys?: readonly TranslationKey[];
  readonly cards?: readonly LegalCard[];
  readonly callout?: LegalCalloutData;
  readonly items?: readonly TranslationKey[];
  readonly link?: {
    readonly labelKey: TranslationKey;
    readonly href: string;
  };
}

export interface LegalDocumentMeta {
  readonly lastUpdatedKey: TranslationKey;
  readonly versionKey: TranslationKey;
  readonly summaryTitleKey: TranslationKey;
  readonly summaryLeadKey: TranslationKey;
  readonly pillars: readonly LegalPillar[];
  readonly tocTitleKey: TranslationKey;
  readonly sisterLabelKey: TranslationKey;
  readonly sisterTitleKey: TranslationKey;
  readonly sisterRoute: string;
  readonly supportTitleKey: TranslationKey;
  readonly supportTextKey: TranslationKey;
}
