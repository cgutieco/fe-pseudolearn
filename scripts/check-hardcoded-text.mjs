import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { listFiles, toPosixPath } from './lib/walk.mjs';
import { splitAstroFile, stripExpressions } from './lib/astro-parts.mjs';
import { runWhenInvokedDirectly } from './lib/cli.mjs';

const HTML_COMMENT = /<!--[\s\S]*?-->/g;
const TEXT_BETWEEN_TAGS = />([^<>]+)</g;
const HTML_ENTITY = /&[a-zA-Z]+;|&#\d+;/g;
const TWO_LETTERS = /\p{L}{2,}/u;

export function collectHardcodedTextViolations(rootDirectory) {
  return listFiles(join(rootDirectory, 'src'), ['.astro']).flatMap((absolutePath) => {
    const relativePath = toPosixPath(rootDirectory, absolutePath);
    const { template } = splitAstroFile(readFileSync(absolutePath, 'utf8'));
    return findLiteralText(template).map((text) => ({
      file: relativePath,
      rule: 'FE-NO-HARDCODED-TEXT',
      message: `Texto literal en la plantilla: "${text}". Todo texto para una persona pasa por t().`,
    }));
  });
}

function findLiteralText(template) {
  const withoutComments = template.replace(HTML_COMMENT, '');
  const withoutExpressions = stripExpressions(withoutComments);
  return [...withoutExpressions.matchAll(TEXT_BETWEEN_TAGS)]
    .map((match) => match[1].replace(HTML_ENTITY, ' ').trim())
    .filter((text) => TWO_LETTERS.test(text));
}

runWhenInvokedDirectly('check:text', collectHardcodedTextViolations, import.meta.url);
