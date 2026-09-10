import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const IGNORED_DIRECTORIES = new Set([
  'node_modules',
  'dist',
  '.astro',
  '.git',
  '.wrangler',
  'coverage',
  '__fixtures__',
]);

export function listFiles(directory, extensions) {
  let entries;
  try {
    entries = readdirSync(directory);
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    const absolutePath = join(directory, entry);
    if (statSync(absolutePath).isDirectory()) {
      return IGNORED_DIRECTORIES.has(entry) ? [] : listFiles(absolutePath, extensions);
    }
    return extensions.some((extension) => entry.endsWith(extension)) ? [absolutePath] : [];
  });
}

export function toPosixPath(rootDirectory, absolutePath) {
  return relative(rootDirectory, absolutePath).split(sep).join('/');
}
