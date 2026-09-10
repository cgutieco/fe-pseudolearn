import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadArchitectureConfig } from './lib/config.mjs';
import { listFiles, toPosixPath } from './lib/walk.mjs';
import { splitAstroFile } from './lib/astro-parts.mjs';
import { runWhenInvokedDirectly } from './lib/cli.mjs';

const DECLARED_CLASS = /\.(-?[_a-zA-Z][\w-]*)/g;
const GLOBAL_WRAPPER = /:global\(([^)]*)\)/g;

export function collectCssScopeViolations(rootDirectory) {
  const config = loadArchitectureConfig(rootDirectory);
  const prefix = config.globalClassPrefix;
  return [
    ...inspectGlobalStylesheets(rootDirectory, config, prefix),
    ...inspectComponentStyles(rootDirectory, prefix),
  ];
}

function inspectGlobalStylesheets(rootDirectory, config, prefix) {
  return listFiles(join(rootDirectory, config.globalStylesheets), ['.css']).flatMap((absolutePath) =>
    declaredClasses(readFileSync(absolutePath, 'utf8'))
      .filter((className) => !className.startsWith(prefix))
      .map((className) => ({
        file: toPosixPath(rootDirectory, absolutePath),
        rule: 'FE-CSS-NAMESPACE',
        message: `La hoja global declara ".${className}" sin el prefijo "${prefix}". El vocabulario público va prefijado.`,
      })),
  );
}

function inspectComponentStyles(rootDirectory, prefix) {
  return listFiles(join(rootDirectory, 'src'), ['.astro']).flatMap((absolutePath) => {
    const { styles } = splitAstroFile(readFileSync(absolutePath, 'utf8'));
    return styles
      .flatMap((style) => declaredClasses(stripGlobalSelectors(style)))
      .filter((className) => className.startsWith(prefix))
      .map((className) => ({
        file: toPosixPath(rootDirectory, absolutePath),
        rule: 'FE-CSS-NAMESPACE',
        message: `El componente declara ".${className}": el prefijo "${prefix}" está reservado al vocabulario global. Usa una clase sin prefijo o :global() para dar estilo a una primitiva ya expuesta.`,
      }));
  });
}

function stripGlobalSelectors(style) {
  return style.replace(GLOBAL_WRAPPER, ' ');
}

function declaredClasses(style) {
  const withoutBodies = style.replace(/\{[^{}]*\}/g, '{}');
  const withoutAtRules = withoutBodies.replace(/@[a-z-]+[^;{]*;/gi, ' ');
  const withoutStrings = withoutAtRules.replace(/'[^']*'|"[^"]*"/g, ' ');
  return [...new Set([...withoutStrings.matchAll(DECLARED_CLASS)].map((match) => match[1]))];
}

runWhenInvokedDirectly('check:css-scope', collectCssScopeViolations, import.meta.url);
