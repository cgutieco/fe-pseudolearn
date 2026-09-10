import type { TranslationKey } from '@shared/i18n/translator';
export type StageId = 'A' | 'B' | 'C';

export interface LearningModule {
  readonly id: string;
  readonly stage: StageId;
}

export interface Stage {
  readonly id: StageId;
  readonly titleKey: TranslationKey;
  readonly summaryKey: TranslationKey;
  readonly labelKey: TranslationKey;
}

export const STAGES: readonly Stage[] = [
  {
    id: 'A',
    titleKey: 'home.track.stageA.title',
    summaryKey: 'home.track.stageA.summary',
    labelKey: 'home.track.stageA.label',
  },
  {
    id: 'B',
    titleKey: 'home.track.stageB.title',
    summaryKey: 'home.track.stageB.summary',
    labelKey: 'home.track.stageB.label',
  },
  {
    id: 'C',
    titleKey: 'home.track.stageC.title',
    summaryKey: 'home.track.stageC.summary',
    labelKey: 'home.track.stageC.label',
  },
];

export const LEARNING_MODULES = [
  { id: 'CON-A1', stage: 'A' },
  { id: 'CON-A2', stage: 'A' },
  { id: 'CON-B1', stage: 'B' },
  { id: 'CON-B2', stage: 'B' },
  { id: 'CON-B3', stage: 'B' },
  { id: 'CON-B4', stage: 'B' },
  { id: 'CON-B5', stage: 'B' },
  { id: 'CON-B6', stage: 'B' },
  { id: 'CON-B7', stage: 'B' },
  { id: 'CON-B8', stage: 'B' },
  { id: 'CON-C1', stage: 'C' },
  { id: 'CON-C2', stage: 'C' },
  { id: 'CON-C3', stage: 'C' },
  { id: 'CON-C4', stage: 'C' },
  { id: 'CON-C5', stage: 'C' },
] as const satisfies readonly LearningModule[];

export type ModuleId = (typeof LEARNING_MODULES)[number]['id'];

export const SPECIFICATION_IDS = [
  'lexical',
  'primitives',
  'operators',
  'assignment',
  'io',
  'control',
  'arrays',
  'subprograms',
  'types',
  'builtins',
  'objects',
] as const;

export const APP_AREA_IDS = [
  'editor',
  'flowchart',
  'structogram',
  'class-diagram',
  'trace-table',
  'knowledge',
  'examples',
  'settings',
  'general',
] as const;

export function modulesInStage(stage: StageId): readonly (typeof LEARNING_MODULES)[number][] {
  return LEARNING_MODULES.filter((module) => module.stage === stage);
}

export function isKnownSubject(candidate: string): boolean {
  return (
    LEARNING_MODULES.some((module) => module.id === candidate) ||
    SPECIFICATION_IDS.some((id) => `spec-${id}` === candidate) ||
    candidate === 'general-question'
  );
}
