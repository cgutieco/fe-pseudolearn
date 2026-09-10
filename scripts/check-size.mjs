import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadArchitectureConfig } from './lib/config.mjs';
import { listFiles, toPosixPath } from './lib/walk.mjs';
import { splitAstroFile } from './lib/astro-parts.mjs';
import { runWhenInvokedDirectly } from './lib/cli.mjs';

export function collectSizeViolations(rootDirectory) {
  const { size } = loadArchitectureConfig(rootDirectory);
  const sourceDirectory = join(rootDirectory, 'src');
  return [
    ...listFiles(sourceDirectory, ['.astro']).flatMap((absolutePath) =>
      inspectAstroFile(rootDirectory, absolutePath, size),
    ),
    ...listFiles(sourceDirectory, ['.ts'])
      .filter((absolutePath) => !absolutePath.endsWith('.test.ts'))
      .flatMap((absolutePath) => inspectTypeScriptFile(rootDirectory, absolutePath, size)),
  ];
}

function inspectAstroFile(rootDirectory, absolutePath, size) {
  const source = readFileSync(absolutePath, 'utf8');
  const relativePath = toPosixPath(rootDirectory, absolutePath);
  const violations = [];
  const totalLines = countLines(source);
  if (totalLines > size.astroFile) {
    violations.push({
      file: relativePath,
      rule: 'FE-SIZE-ASTRO-FILE',
      message: `${totalLines} líneas frente al límite de ${size.astroFile}. Extrae un widget o una feature.`,
    });
  }
  const templateLines = countLines(splitAstroFile(source).template);
  if (templateLines > size.astroTemplate) {
    violations.push({
      file: relativePath,
      rule: 'FE-SIZE-ASTRO-TEMPLATE',
      message: `La plantilla tiene ${templateLines} líneas frente al límite de ${size.astroTemplate}.`,
    });
  }
  return violations;
}

function inspectTypeScriptFile(rootDirectory, absolutePath, size) {
  const totalLines = countLines(readFileSync(absolutePath, 'utf8'));
  if (totalLines <= size.typescriptFile) return [];
  return [
    {
      file: toPosixPath(rootDirectory, absolutePath),
      rule: 'FE-SIZE-TS-FILE',
      message: `${totalLines} líneas frente al límite de ${size.typescriptFile}. Separa responsabilidades.`,
    },
  ];
}

function countLines(source) {
  const trimmed = source.trim();
  return trimmed === '' ? 0 : trimmed.split('\n').length;
}

runWhenInvokedDirectly('check:size', collectSizeViolations, import.meta.url);
