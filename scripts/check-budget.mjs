import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { loadArchitectureConfig } from './lib/config.mjs';
import { listFiles, toPosixPath } from './lib/walk.mjs';
import { runWhenInvokedDirectly } from './lib/cli.mjs';

const SCRIPT_SOURCE = /<script\b[^>]*\bsrc=["']([^"']+)["']/g;
const INLINE_SCRIPT =
  /<script\b(?![^>]*\bsrc=)(?![^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/g;
const STYLESHEET_HREF = /<link\b[^>]*\brel=["']stylesheet["'][^>]*\bhref=["']([^"']+)["']/g;
const INLINE_STYLE = /<style\b[^>]*>([\s\S]*?)<\/style>/g;

export function collectBudgetViolations(rootDirectory) {
  const { budget } = loadArchitectureConfig(rootDirectory);
  const distDirectory = join(rootDirectory, 'dist');
  if (!existsSync(distDirectory)) {
    return [
      {
        file: 'dist',
        rule: 'FE-JS-BUDGET',
        message: 'No hay build. Ejecuta pnpm build antes del presupuesto.',
      },
    ];
  }
  const clientDirectory = existsSync(join(distDirectory, 'client'))
    ? join(distDirectory, 'client')
    : distDirectory;
  const pages = listFiles(clientDirectory, ['.html']);
  return [
    ...pages.flatMap((page) =>
      inspectPage({ rootDirectory, distDirectory: clientDirectory, absolutePath: page, budget }),
    ),
    ...inspectTotalClientJavaScript(clientDirectory, budget),
  ];
}

function inspectPage({ rootDirectory, distDirectory, absolutePath, budget }) {
  const html = readFileSync(absolutePath, 'utf8');
  const relativePath = toPosixPath(rootDirectory, absolutePath);
  const javascriptBytes =
    sumReferencedAssets(distDirectory, html, SCRIPT_SOURCE) + sumInlineContent(html, INLINE_SCRIPT);
  const cssBytes =
    sumReferencedAssets(distDirectory, html, STYLESHEET_HREF) + sumInlineContent(html, INLINE_STYLE);
  const violations = [];
  if (javascriptBytes > budget.clientJavaScriptPerRouteBytes) {
    violations.push({
      file: relativePath,
      rule: 'FE-JS-BUDGET',
      message: `${javascriptBytes} B de JavaScript frente al presupuesto de ${budget.clientJavaScriptPerRouteBytes} B.`,
    });
  }
  if (cssBytes > budget.cssPerRouteBytes) {
    violations.push({
      file: relativePath,
      rule: 'FE-JS-BUDGET',
      message: `${cssBytes} B de CSS frente al presupuesto de ${budget.cssPerRouteBytes} B.`,
    });
  }
  return violations;
}

function inspectTotalClientJavaScript(distDirectory, budget) {
  const total = listFiles(join(distDirectory, '_astro'), ['.js'])
    .map((absolutePath) => statSync(absolutePath).size)
    .reduce((sum, size) => sum + size, 0);
  if (total <= budget.totalJavaScriptBytes) return [];
  return [
    {
      file: 'dist/_astro',
      rule: 'FE-JS-BUDGET',
      message: `${total} B de JavaScript de cliente en total frente al presupuesto de ${budget.totalJavaScriptBytes} B.`,
    },
  ];
}

function sumReferencedAssets(distDirectory, html, pattern) {
  return [...html.matchAll(pattern)]
    .map((match) => match[1])
    .filter((reference) => reference.startsWith('/'))
    .map((reference) => join(distDirectory, reference))
    .filter((absolutePath) => existsSync(absolutePath))
    .map((absolutePath) => statSync(absolutePath).size)
    .reduce((sum, size) => sum + size, 0);
}

function sumInlineContent(html, pattern) {
  return [...html.matchAll(pattern)]
    .map((match) => Buffer.byteLength(match[1], 'utf8'))
    .reduce((sum, size) => sum + size, 0);
}

runWhenInvokedDirectly('check:budget', collectBudgetViolations, import.meta.url);
