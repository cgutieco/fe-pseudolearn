import type { TranslationKey } from '@shared/i18n/translator';
export interface CurriculumMetric {
  readonly value: number;
  readonly labelKey: TranslationKey;
}

export const CURRICULUM_METRICS: readonly CurriculumMetric[] = [
  { value: 15, labelKey: 'home.metrics.modules' },
  { value: 95, labelKey: 'home.metrics.exercises' },
  { value: 86, labelKey: 'home.metrics.programs' },
  { value: 11, labelKey: 'home.metrics.specs' },
];
