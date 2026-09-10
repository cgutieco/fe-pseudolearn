import { SITE } from '@shared/config/site';
import { isKnownPlatform } from '@entities/platform/model/platform';
import { APP_AREA_IDS, isKnownSubject } from '@entities/learning-module/model/curriculum';
import {
  isContactReason,
  isFrequency,
  type ContactReason,
  type ContactRequest,
  type FieldErrorCode,
} from './contact-request';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_MAX_LENGTH = 120;
const SHORT_TEXT_MAX_LENGTH = 300;
const VERSION_MAX_LENGTH = 40;

type RawFields = Readonly<Record<string, string>>;
type FieldErrors = Record<string, FieldErrorCode>;

export type ValidationResult =
  | { readonly kind: 'valid'; readonly request: ContactRequest }
  | { readonly kind: 'invalid'; readonly fields: FieldErrors };

export function validateContactRequest(raw: RawFields): ValidationResult {
  const fields: FieldErrors = {
    ...validateRequiredFields(raw),
    ...validateLengths(raw),
    ...validateOptionFields(raw),
  };
  if (Object.keys(fields).length > 0) return { kind: 'invalid', fields };
  return { kind: 'valid', request: buildRequest(raw) };
}

function validateRequiredFields(raw: RawFields): FieldErrors {
  const fields: FieldErrors = {};
  const reason = trimmed(raw.reason);
  const email = trimmed(raw.email);
  const message = trimmed(raw.message);

  if (reason === '') fields.reason = 'required';
  else if (!isContactReason(reason)) fields.reason = 'unknown_option';

  if (email === '') fields.email = 'required';
  else if (!EMAIL_PATTERN.test(email)) fields.email = 'invalid';

  if (message === '') fields.message = 'required';
  if (raw.acceptPrivacy !== 'on') fields.acceptPrivacy = 'required';
  if (reason === 'feature' && trimmed(raw.featureIntent) === '') fields.featureIntent = 'required';

  return fields;
}

function validateLengths(raw: RawFields): FieldErrors {
  const limits: Readonly<Record<string, number>> = {
    message: SITE.messageMaxLength,
    codeSnippet: SITE.snippetMaxLength,
    name: NAME_MAX_LENGTH,
    appVersion: VERSION_MAX_LENGTH,
    executionStep: SHORT_TEXT_MAX_LENGTH,
    featureIntent: SHORT_TEXT_MAX_LENGTH,
    currentWorkaround: SHORT_TEXT_MAX_LENGTH,
    friction: SHORT_TEXT_MAX_LENGTH,
  };
  const fields: FieldErrors = {};
  for (const [name, maxLength] of Object.entries(limits)) {
    const value = raw[name];
    if (value !== undefined && value.length > maxLength) fields[name] = 'too_long';
  }
  return fields;
}

function validateOptionFields(raw: RawFields): FieldErrors {
  const checks: readonly [string, string | undefined, (value: string) => boolean][] = [
    ['platform', raw.platform, isKnownPlatform],
    ['appArea', raw.appArea, (value) => (APP_AREA_IDS as readonly string[]).includes(value)],
    ['subject', raw.subject, isKnownSubject],
    ['frequency', raw.frequency, isFrequency],
  ];
  const fields: FieldErrors = {};
  for (const [name, value, isValid] of checks) {
    if (value !== undefined && value !== '' && !isValid(value)) fields[name] = 'unknown_option';
  }
  return fields;
}

function buildRequest(raw: RawFields): ContactRequest {
  return {
    reason: trimmed(raw.reason) as ContactReason,
    email: trimmed(raw.email),
    message: trimmed(raw.message),
    name: trimmed(raw.name),
    locale: raw.locale === 'en' ? 'en' : 'es',
    includeEnvironment: raw.includeEnvironment === 'on',
    platform: optional(raw.platform),
    appVersion: optional(raw.appVersion),
    executionStep: optional(raw.executionStep),
    codeSnippet: optional(raw.codeSnippet),
    featureIntent: optional(raw.featureIntent),
    currentWorkaround: optional(raw.currentWorkaround),
    frequency: isFrequency(raw.frequency ?? '') ? (raw.frequency as ContactRequest['frequency']) : undefined,
    appArea: optional(raw.appArea),
    friction: optional(raw.friction),
    subject: optional(raw.subject),
  };
}

function trimmed(value: string | undefined): string {
  return (value ?? '').trim();
}

function optional(value: string | undefined): string | undefined {
  const result = trimmed(value);
  return result === '' ? undefined : result;
}
