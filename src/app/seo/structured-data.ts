import { SITE } from '@shared/config/site';

export interface StructuredDataInput {
  readonly locale: string;
  readonly name: string;
  readonly description: string;
  readonly canonical: string;
}

export function buildSoftwareApplication(input: StructuredDataInput): Record<string, unknown> {
  return {
    '@type': 'SoftwareApplication',
    name: input.name,
    description: input.description,
    url: SITE.url,
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'macOS 13+, iOS 16+',
    inLanguage: input.locale,
    offers: { '@type': 'Offer', category: 'paid' },
    author: { '@type': 'Person', name: 'Cesar Antonio Gutierrez Contreras', url: SITE.authorUrl },
  };
}

export function buildOrganization(): Record<string, unknown> {
  return {
    '@type': 'Organization',
    name: 'PseudoLearn',
    url: SITE.url,
    logo: `${SITE.url}/favicon.svg`,
    email: SITE.supportEmail,
  };
}

export function buildWebSite(input: StructuredDataInput): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    name: 'PseudoLearn',
    url: SITE.url,
    inLanguage: input.locale,
    description: input.description,
  };
}

export function buildStructuredData(input: StructuredDataInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@graph': [buildWebSite(input), buildOrganization(), buildSoftwareApplication(input)],
  };
}
