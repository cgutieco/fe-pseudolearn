import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';

export function loadArchitectureConfig(rootDirectory) {
  return parse(readFileSync(join(rootDirectory, 'architecture.yaml'), 'utf8'));
}
