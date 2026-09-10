import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';
import { defineConfig } from 'eslint/config';

const sharedRules = {
  'no-console': ['error', { allow: ['warn', 'error'] }],
  'no-else-return': 'error',
  'no-nested-ternary': 'error',
  'no-param-reassign': 'error',
  'prefer-const': 'error',
  'object-shorthand': 'error',
  eqeqeq: ['error', 'always'],
  complexity: ['error', 10],
  'max-depth': ['error', 3],
  'max-params': ['error', 3],
  'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
};

export default defineConfig(
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      'playwright-report/',
      'test-results/',
      'tests/**/*-snapshots/',
      'scripts/__fixtures__/',
      '.wrangler/',
      'coverage/',
      'design/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: sharedRules,
  },
  {
    files: ['scripts/**/*.mjs'],
    languageOptions: { globals: globals.node },
    rules: { 'no-console': 'off' },
  },
  {
    files: ['**/*.test.ts', 'tests/**/*.ts'],
    rules: { 'max-lines-per-function': 'off' },
  },
  {
    files: ['**/*.astro'],
    rules: { 'max-lines-per-function': 'off' },
  },
);
