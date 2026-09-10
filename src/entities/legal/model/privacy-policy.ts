import type { LegalDocumentMeta, LegalSection } from './legal-document';

export const PRIVACY_META: LegalDocumentMeta = {
  lastUpdatedKey: 'privacy.meta.lastUpdated',
  versionKey: 'privacy.meta.version',
  summaryTitleKey: 'privacy.summary.title',
  summaryLeadKey: 'privacy.summary.lead',
  pillars: [
    {
      titleKey: 'privacy.summary.pillar1Title',
      textKey: 'privacy.summary.pillar1Text',
    },
    {
      titleKey: 'privacy.summary.pillar2Title',
      textKey: 'privacy.summary.pillar2Text',
    },
    {
      titleKey: 'privacy.summary.pillar3Title',
      textKey: 'privacy.summary.pillar3Text',
    },
  ],
  tocTitleKey: 'privacy.toc.title',
  sisterLabelKey: 'privacy.nav.sisterLabel',
  sisterTitleKey: 'privacy.nav.sisterTitle',
  sisterRoute: '/terms',
  supportTitleKey: 'privacy.nav.supportTitle',
  supportTextKey: 'privacy.nav.supportText',
};

export const PRIVACY_SECTIONS: readonly LegalSection[] = [
  {
    id: 'datos',
    number: '01',
    titleKey: 'privacy.section.data.title',
    leadKey: 'privacy.section.data.lead',
    cards: [
      {
        titleKey: 'privacy.section.data.cardNoAccountTitle',
        textKey: 'privacy.section.data.cardNoAccountText',
      },
      {
        titleKey: 'privacy.section.data.cardAccountTitle',
        textKey: 'privacy.section.data.cardAccountText',
      },
      {
        titleKey: 'privacy.section.data.cardContactTitle',
        textKey: 'privacy.section.data.cardContactText',
      },
    ],
    callout: {
      titleKey: 'privacy.section.data.calloutTitle',
      textKey: 'privacy.section.data.calloutText',
    },
  },
  {
    id: 'almacenamiento',
    number: '02',
    titleKey: 'privacy.section.storage.title',
    leadKey: 'privacy.section.storage.lead',
    cards: [
      {
        titleKey: 'privacy.section.storage.deviceTitle',
        textKey: 'privacy.section.storage.deviceText',
      },
      {
        titleKey: 'privacy.section.storage.cloudTitle',
        textKey: 'privacy.section.storage.cloudText',
      },
      {
        titleKey: 'privacy.section.storage.webTitle',
        textKey: 'privacy.section.storage.webText',
      },
      {
        titleKey: 'privacy.section.storage.assetsTitle',
        textKey: 'privacy.section.storage.assetsText',
      },
    ],
  },
  {
    id: 'acceso',
    number: '03',
    titleKey: 'privacy.section.auth.title',
    leadKey: 'privacy.section.auth.lead',
    cards: [
      {
        titleKey: 'privacy.section.auth.providersTitle',
        textKey: 'privacy.section.auth.providersText',
      },
      {
        titleKey: 'privacy.section.auth.ageTitle',
        textKey: 'privacy.section.auth.ageText',
      },
    ],
  },
  {
    id: 'eliminacion',
    number: '04',
    titleKey: 'privacy.section.deletion.title',
    leadKey: 'privacy.section.deletion.lead',
    cards: [
      {
        titleKey: 'privacy.section.deletion.selfServiceTitle',
        textKey: 'privacy.section.deletion.selfServiceText',
      },
      {
        titleKey: 'privacy.section.deletion.localRetentionTitle',
        textKey: 'privacy.section.deletion.localRetentionText',
      },
      {
        titleKey: 'privacy.section.deletion.manualTitle',
        textKey: 'privacy.section.deletion.manualText',
      },
    ],
  },
  {
    id: 'plazos',
    number: '05',
    titleKey: 'privacy.section.retention.title',
    leadKey: 'privacy.section.retention.lead',
    items: [
      'privacy.section.retention.itemDevice',
      'privacy.section.retention.itemSync',
      'privacy.section.retention.itemSupport',
      'privacy.section.retention.itemInactivity',
    ],
  },
  {
    id: 'derechos',
    number: '06',
    titleKey: 'privacy.section.rights.title',
    leadKey: 'privacy.section.rights.lead',
    bodyKeys: [
      'privacy.section.rights.text1',
      'privacy.section.rights.text2',
      'privacy.section.rights.text3',
    ],
  },
  {
    id: 'contacto',
    number: '07',
    titleKey: 'privacy.section.contact.title',
    leadKey: 'privacy.section.contact.lead',
    bodyKeys: ['privacy.section.contact.text1', 'privacy.section.contact.text2'],
  },
];
