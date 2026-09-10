import type { LegalDocumentMeta, LegalSection } from './legal-document';

export const TERMS_META: LegalDocumentMeta = {
  lastUpdatedKey: 'terms.meta.lastUpdated',
  versionKey: 'terms.meta.version',
  summaryTitleKey: 'terms.summary.title',
  summaryLeadKey: 'terms.summary.lead',
  pillars: [
    {
      titleKey: 'terms.summary.pillar1Title',
      textKey: 'terms.summary.pillar1Text',
    },
    {
      titleKey: 'terms.summary.pillar2Title',
      textKey: 'terms.summary.pillar2Text',
    },
    {
      titleKey: 'terms.summary.pillar3Title',
      textKey: 'terms.summary.pillar3Text',
    },
  ],
  tocTitleKey: 'terms.toc.title',
  sisterLabelKey: 'terms.nav.sisterLabel',
  sisterTitleKey: 'terms.nav.sisterTitle',
  sisterRoute: '/privacy',
  supportTitleKey: 'terms.nav.supportTitle',
  supportTextKey: 'terms.nav.supportText',
};

export const TERMS_SECTIONS: readonly LegalSection[] = [
  {
    id: 'aceptacion',
    number: '01',
    titleKey: 'terms.section.acceptance.title',
    leadKey: 'terms.section.acceptance.lead',
    bodyKeys: ['terms.section.acceptance.text'],
  },
  {
    id: 'licencia',
    number: '02',
    titleKey: 'terms.section.license.title',
    leadKey: 'terms.section.license.lead',
    cards: [
      {
        titleKey: 'terms.section.license.appStoreTitle',
        textKey: 'terms.section.license.appStoreText',
      },
      {
        titleKey: 'terms.section.license.restrictionsTitle',
        textKey: 'terms.section.license.restrictionsText',
      },
    ],
  },
  {
    id: 'cuenta',
    number: '03',
    titleKey: 'terms.section.account.title',
    leadKey: 'terms.section.account.lead',
    bodyKeys: ['terms.section.account.text1', 'terms.section.account.text2'],
  },
  {
    id: 'propiedad-algoritmos',
    number: '04',
    titleKey: 'terms.section.ownership.title',
    leadKey: 'terms.section.ownership.lead',
    callout: {
      titleKey: 'terms.section.ownership.calloutTitle',
      textKey: 'terms.section.ownership.calloutText',
    },
    cards: [
      {
        titleKey: 'terms.section.ownership.syncScopeTitle',
        textKey: 'terms.section.ownership.syncScopeText',
      },
      {
        titleKey: 'terms.section.ownership.localCopyTitle',
        textKey: 'terms.section.ownership.localCopyText',
      },
    ],
  },
  {
    id: 'uso-aceptable',
    number: '05',
    titleKey: 'terms.section.acceptable.title',
    leadKey: 'terms.section.acceptable.lead',
    bodyKeys: ['terms.section.acceptable.text'],
  },
  {
    id: 'propiedad-intelectual',
    number: '06',
    titleKey: 'terms.section.ip.title',
    leadKey: 'terms.section.ip.lead',
    cards: [
      {
        titleKey: 'terms.section.ip.coreTitle',
        textKey: 'terms.section.ip.coreText',
      },
      {
        titleKey: 'terms.section.ip.curriculumTitle',
        textKey: 'terms.section.ip.curriculumText',
      },
      {
        titleKey: 'terms.section.ip.webTitle',
        textKey: 'terms.section.ip.webText',
      },
    ],
  },
  {
    id: 'precio-compras',
    number: '07',
    titleKey: 'terms.section.pricing.title',
    leadKey: 'terms.section.pricing.lead',
    bodyKeys: ['terms.section.pricing.text1', 'terms.section.pricing.text2'],
  },
  {
    id: 'disponibilidad',
    number: '08',
    titleKey: 'terms.section.availability.title',
    leadKey: 'terms.section.availability.lead',
    bodyKeys: ['terms.section.availability.text1', 'terms.section.availability.text2'],
  },
  {
    id: 'garantias',
    number: '09',
    titleKey: 'terms.section.warranties.title',
    leadKey: 'terms.section.warranties.lead',
    bodyKeys: ['terms.section.warranties.text1', 'terms.section.warranties.text2'],
  },
  {
    id: 'privacidad',
    number: '10',
    titleKey: 'terms.section.privacy.title',
    leadKey: 'terms.section.privacy.lead',
    bodyKeys: ['terms.section.privacy.text'],
    link: {
      labelKey: 'terms.section.privacy.linkText',
      href: '/privacy',
    },
  },
  {
    id: 'ley-aplicable',
    number: '11',
    titleKey: 'terms.section.governing.title',
    leadKey: 'terms.section.governing.lead',
    bodyKeys: ['terms.section.governing.text1', 'terms.section.governing.text2'],
  },
];
