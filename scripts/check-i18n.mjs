import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { listFiles, toPosixPath } from './lib/walk.mjs';
import { runWhenInvokedDirectly } from './lib/cli.mjs';

const DICTIONARY_DIRECTORY = 'src/shared/i18n';
const CALLED_KEY = /\bt\(\s*'([a-zA-Z0-9._-]+)'/g;
const DYNAMIC_PREFIX = /\bt\(\s*`([a-zA-Z0-9._-]*)\$\{/g;
const PLURAL_BASE = /\bplural\(\s*'([a-zA-Z0-9._-]+)'/g;
const KEY_SHAPED_LITERAL = /'([a-z][a-zA-Z0-9-]*(?:\.[a-zA-Z0-9_-]+)+)'/g;

export function collectI18nViolations(rootDirectory) {
  const spanish = readDictionary(rootDirectory, 'es.json');
  const english = readDictionary(rootDirectory, 'en.json');
  const usage = collectUsage(rootDirectory);
  return [
    ...findKeyGaps(spanish, english, 'en.json'),
    ...findKeyGaps(english, spanish, 'es.json'),
    ...findEmptyValues(spanish, 'es.json'),
    ...findEmptyValues(english, 'en.json'),
    ...findMissingKeys(spanish, usage),
    ...findUnusedKeys(spanish, usage),
  ];
}

function readDictionary(rootDirectory, fileName) {
  return JSON.parse(readFileSync(join(rootDirectory, DICTIONARY_DIRECTORY, fileName), 'utf8'));
}

function collectUsage(rootDirectory) {
  const calledKeys = new Set();
  const referencedKeys = new Set();
  const dynamicPrefixes = new Set();
  const occurrences = new Map();

  for (const absolutePath of listFiles(join(rootDirectory, 'src'), ['.astro', '.ts'])) {
    if (absolutePath.includes(`${DICTIONARY_DIRECTORY.split('/').at(-1)}/es.json`)) continue;
    const relativePath = toPosixPath(rootDirectory, absolutePath);
    const source = readFileSync(absolutePath, 'utf8');
    for (const match of source.matchAll(CALLED_KEY)) {
      calledKeys.add(match[1]);
      if (!occurrences.has(match[1])) occurrences.set(match[1], relativePath);
    }
    for (const match of source.matchAll(KEY_SHAPED_LITERAL)) referencedKeys.add(match[1]);
    for (const match of source.matchAll(DYNAMIC_PREFIX)) dynamicPrefixes.add(match[1]);
    for (const match of source.matchAll(PLURAL_BASE)) dynamicPrefixes.add(`${match[1]}.`);
  }

  return { calledKeys, referencedKeys, dynamicPrefixes, occurrences };
}

function findKeyGaps(source, target, targetName) {
  return Object.keys(source)
    .filter((key) => !(key in target))
    .map((key) => ({
      file: `${DICTIONARY_DIRECTORY}/${targetName}`,
      rule: 'FE-I18N-PARITY',
      message: `Falta la clave "${key}", presente en el otro diccionario.`,
    }));
}

function findEmptyValues(dictionary, fileName) {
  return Object.entries(dictionary)
    .filter(([, value]) => typeof value !== 'string' || value.trim() === '')
    .map(([key]) => ({
      file: `${DICTIONARY_DIRECTORY}/${fileName}`,
      rule: 'FE-I18N-PARITY',
      message: `La clave "${key}" no tiene una cadena con contenido.`,
    }));
}

function findMissingKeys(dictionary, usage) {
  return [...usage.calledKeys]
    .filter((key) => !(key in dictionary))
    .map((key) => ({
      file: usage.occurrences.get(key),
      rule: 'FE-I18N-PARITY',
      message: `Se invoca la clave "${key}" y no existe en los diccionarios.`,
    }));
}

function findUnusedKeys(dictionary, usage) {
  const prefixes = [...usage.dynamicPrefixes].filter((prefix) => prefix !== '');
  return Object.keys(dictionary)
    .filter((key) => !usage.referencedKeys.has(key))
    .filter((key) => !prefixes.some((prefix) => key.startsWith(prefix)))
    .map((key) => ({
      file: `${DICTIONARY_DIRECTORY}/es.json`,
      rule: 'FE-I18N-PARITY',
      message: `La clave "${key}" no la referencia ningún componente ni ningún catálogo.`,
    }));
}

runWhenInvokedDirectly('check:i18n', collectI18nViolations, import.meta.url);
