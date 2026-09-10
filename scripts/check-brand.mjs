import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { listFiles, toPosixPath } from './lib/walk.mjs';
import { runWhenInvokedDirectly } from './lib/cli.mjs';

const GENERATED_MODULE = 'src/shared/ui/brand-mark/symbol-path.generated.ts';
const PATH_DATA = /[Mm]\s*-?\d[\d.,\s]*[A-Za-z][\d.,\s MmHhVvAaLlCcQqSsTtZz-]{120,}/;

export function collectBrandViolations(rootDirectory) {
  const sourceDirectory = join(rootDirectory, 'src');
  return listFiles(sourceDirectory, ['.astro', '.ts'])
    .map((absolutePath) => ({
      absolutePath,
      relativePath: toPosixPath(rootDirectory, absolutePath),
    }))
    .filter(({ relativePath }) => relativePath !== GENERATED_MODULE)
    .flatMap(({ absolutePath, relativePath }) =>
      firstPathDataLine(readFileSync(absolutePath, 'utf8')).map((line) => ({
        file: relativePath,
        line,
        rule: 'FE-BRAND-GENERATED',
        message: `Geometría de marca escrita a mano. La marca se importa de ${GENERATED_MODULE}, que emite el motor de marca; una copia pegada deja de seguir al vector maestro.`,
      })),
    );
}

function firstPathDataLine(source) {
  const match = PATH_DATA.exec(source);
  return match === null ? [] : [source.slice(0, match.index).split('\n').length];
}

runWhenInvokedDirectly('check:brand', collectBrandViolations, import.meta.url);
