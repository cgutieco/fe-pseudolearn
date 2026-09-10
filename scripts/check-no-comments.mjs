import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { listFiles, toPosixPath } from './lib/walk.mjs';
import { splitAstroFile } from './lib/astro-parts.mjs';
import { findCssComments, findHtmlComments, findJavaScriptComments } from './lib/comments.mjs';
import { runWhenInvokedDirectly } from './lib/cli.mjs';

const ALLOWED_DIRECTIVE =
  /^\s*(eslint-disable[a-z-]*|eslint-enable|@ts-expect-error|@ts-ignore|prettier-ignore|stylelint-disable[a-z-]*|stylelint-enable)\b[^\p{L}]*$/u;

export function collectCommentViolations(rootDirectory) {
  const targets = [
    ...listFiles(join(rootDirectory, 'src'), ['.astro', '.ts', '.css']),
    ...listFiles(join(rootDirectory, 'scripts'), ['.mjs', '.ts']),
    ...listFiles(join(rootDirectory, 'tests'), ['.ts']),
  ];
  return targets.flatMap((absolutePath) =>
    commentsIn(absolutePath, readFileSync(absolutePath, 'utf8'))
      .filter((comment) => !ALLOWED_DIRECTIVE.test(comment.text))
      .map((comment) => ({
        file: toPosixPath(rootDirectory, absolutePath),
        line: comment.line,
        rule: 'FE-NO-COMMENTS',
        message: `Comentario prohibido: "${comment.text.trim().slice(0, 70)}". El nombre y el cuerpo explican el qué; el porqué va al README.`,
      })),
  );
}

function commentsIn(absolutePath, source) {
  if (absolutePath.endsWith('.css')) return findCssComments(source);
  if (!absolutePath.endsWith('.astro')) return findJavaScriptComments(source);
  const parts = splitAstroFile(source);
  return [
    ...findJavaScriptComments(parts.frontmatter),
    ...parts.scripts.flatMap(findJavaScriptComments),
    ...parts.styles.flatMap(findCssComments),
    ...findHtmlComments(parts.template),
  ];
}

runWhenInvokedDirectly('check:comments', collectCommentViolations, import.meta.url);
