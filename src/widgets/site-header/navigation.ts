import { ANCHORS } from '@shared/config/site';
import type { Locale } from '@shared/i18n/locales';
import type { TranslationKey } from '@shared/i18n/translator';
import { ROUTES, anchorOnHome, localizePath } from '@shared/i18n/routes';

export interface NavigationLink {
  readonly labelKey: TranslationKey;
  readonly href: string;
  readonly path: string;
  readonly homeHref: string;
}

export function buildNavigation(locale: Locale): readonly NavigationLink[] {
  const home = localizePath(ROUTES.home, locale);
  const anchor = (name: string) => anchorOnHome(name, locale);
  const link = (labelKey: TranslationKey, href: string, path: string): NavigationLink => ({
    labelKey,
    href,
    path,
    homeHref: home,
  });

  return [
    link('nav.editor', anchor(ANCHORS.editor), ROUTES.home),
    link('nav.track', anchor(ANCHORS.track), ROUTES.home),
    link('nav.downloads', anchor(ANCHORS.downloads), ROUTES.home),
    link('nav.contact', localizePath(ROUTES.contact, locale), ROUTES.contact),
    link('nav.versions', localizePath(ROUTES.versions, locale), ROUTES.versions),
  ];
}

export interface FooterColumn {
  readonly titleKey: TranslationKey;
  readonly links: readonly { labelKey: TranslationKey; href: string }[];
}

export function buildFooterColumns(locale: Locale): readonly FooterColumn[] {
  const anchor = (name: string) => anchorOnHome(name, locale);
  const contact = localizePath(ROUTES.contact, locale);
  return [
    {
      titleKey: 'footer.columnProduct',
      links: [
        { labelKey: 'nav.editor', href: anchor(ANCHORS.editor) },
        { labelKey: 'nav.track', href: anchor(ANCHORS.track) },
        { labelKey: 'footer.linkSpec', href: anchor(ANCHORS.specification) },
        { labelKey: 'nav.downloads', href: anchor(ANCHORS.downloads) },
      ],
    },
    {
      titleKey: 'footer.columnSupport',
      links: [
        { labelKey: 'nav.contact', href: contact },
        { labelKey: 'footer.linkReport', href: contact },
        { labelKey: 'footer.linkFaq', href: contact },
      ],
    },
    {
      titleKey: 'footer.columnProject',
      links: [
        { labelKey: 'nav.versions', href: localizePath(ROUTES.versions, locale) },
        { labelKey: 'footer.linkPrivacy', href: localizePath(ROUTES.privacy, locale) },
        { labelKey: 'footer.linkTerms', href: localizePath(ROUTES.terms, locale) },
      ],
    },
  ];
}
