import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { loadArchitectureConfig } from './lib/config.mjs';
import { listFiles, toPosixPath } from './lib/walk.mjs';
import { extractImportSpecifiers } from './lib/imports.mjs';
import { splitAstroFile } from './lib/astro-parts.mjs';
import { runWhenInvokedDirectly } from './lib/cli.mjs';

const SOURCE_EXTENSIONS = ['.astro', '.ts', '.tsx', '.js', '.mjs'];
const ALIAS_PATTERN = /^@(app|views|widgets|features|entities|shared)\//;

export function collectArchitectureViolations(rootDirectory) {
  const config = loadArchitectureConfig(rootDirectory);
  const sourceDirectory = join(rootDirectory, 'src');
  const files = listFiles(sourceDirectory, SOURCE_EXTENSIONS);
  return [
    ...findForbiddenDirectories(rootDirectory, config),
    ...findLayerBarrels(rootDirectory, config),
    ...findUndeclaredTopLevelDirectories(rootDirectory, config),
    ...files.flatMap((file) => inspectFile(rootDirectory, file, config)),
  ];
}

function inspectFile(rootDirectory, absolutePath, config) {
  const source = readFileSync(absolutePath, 'utf8');
  const scannable = absolutePath.endsWith('.astro') ? scannableAstroSource(source) : source;
  const file = {
    rootDirectory,
    config,
    source,
    relativePath: toPosixPath(rootDirectory, absolutePath),
    specifiers: extractImportSpecifiers(scannable),
  };
  return [...checkExclusiveImports(file), ...checkImportDirection(file), ...checkRouteWrapper(file)];
}

function scannableAstroSource(source) {
  const parts = splitAstroFile(source);
  return [parts.frontmatter, ...parts.scripts].join('\n');
}

function layerOf(relativePath, config) {
  for (const [name, layer] of Object.entries(config.layers)) {
    if (relativePath.startsWith(`${layer.directory}/`)) return name;
  }
  if (relativePath.startsWith(`${config.routes.directory}/`)) return 'pages';
  return null;
}

function resolveTargetLayer(file, specifier) {
  const aliasMatch = ALIAS_PATTERN.exec(specifier);
  if (aliasMatch) return aliasMatch[1];
  if (!specifier.startsWith('.')) return null;
  const absoluteTarget = resolve(file.rootDirectory, dirname(file.relativePath), specifier);
  return layerOf(toPosixPath(file.rootDirectory, absoluteTarget), file.config);
}

function checkImportDirection(file) {
  const sourceLayer = layerOf(file.relativePath, file.config);
  if (!sourceLayer || sourceLayer === 'pages') return [];
  const allowed = file.config.layers[sourceLayer].imports;
  return file.specifiers.flatMap((specifier) => {
    const targetLayer = resolveTargetLayer(file, specifier);
    if (!targetLayer || allowed.includes(targetLayer)) return [];
    return [
      {
        file: file.relativePath,
        rule: 'FE-LAYER-DIRECTION',
        message: `La capa "${sourceLayer}" no puede importar de "${targetLayer}" (${specifier}). Permitido: ${allowed.join(', ')}.`,
      },
    ];
  });
}

function checkRouteWrapper(file) {
  const { config, relativePath } = file;
  if (!relativePath.startsWith(`${config.routes.directory}/`)) return [];
  const violations = [];
  const lineCount = file.source.trimEnd().split('\n').length;
  if (relativePath.endsWith('.astro') && lineCount > config.routes.maxLines) {
    violations.push({
      file: relativePath,
      rule: 'FE-THIN-ROUTES',
      message: `El envoltorio de ruta tiene ${lineCount} líneas y el límite es ${config.routes.maxLines}. La lógica va en views/.`,
    });
  }
  for (const specifier of file.specifiers) {
    const aliasMatch = ALIAS_PATTERN.exec(specifier);
    if (!aliasMatch) continue;
    if (!config.routes.imports.includes(aliasMatch[1])) {
      violations.push({
        file: relativePath,
        rule: 'FE-THIN-ROUTES',
        message: `Un envoltorio de ruta solo importa de ${config.routes.imports.join(', ')}; encontrado "${specifier}".`,
      });
    }
  }
  return violations;
}

function checkExclusiveImports(file) {
  return Object.entries(file.config.exclusiveImports ?? {}).flatMap(([moduleName, ownerPath]) => {
    if (!file.specifiers.includes(moduleName) || file.relativePath === ownerPath) return [];
    return [
      {
        file: file.relativePath,
        rule: 'FE-RUNTIME-ISOLATION',
        message: `Solo ${ownerPath} puede importar "${moduleName}".`,
      },
    ];
  });
}

function findLayerBarrels(rootDirectory, config) {
  return Object.values(config.layers).flatMap((layer) =>
    ['index.ts', 'index.js']
      .filter((name) => existsSync(join(rootDirectory, layer.directory, name)))
      .map((name) => ({
        file: `${layer.directory}/${name}`,
        rule: 'FE-NO-LAYER-BARREL',
        message:
          'Un barrel de capa completa arrastra el CSS de todo lo que reexporta. Importa cada módulo por su ruta.',
      })),
  );
}

function findForbiddenDirectories(rootDirectory, config) {
  return (config.forbiddenDirectories ?? [])
    .filter((directory) => existsSync(join(rootDirectory, directory)))
    .map((directory) => ({
      file: directory,
      rule: 'FE-LAYER-DIRECTION',
      message: 'Carpeta heredada prohibida: su contenido pertenece a una capa FSD.',
    }));
}

function findUndeclaredTopLevelDirectories(rootDirectory, config) {
  const declared = new Set([
    ...Object.values(config.layers).map((layer) => layer.directory.replace('src/', '')),
    ...(config.unlayeredDirectories ?? []),
  ]);
  const sourceDirectory = join(rootDirectory, 'src');
  if (!existsSync(sourceDirectory)) return [];
  return readdirSync(sourceDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !declared.has(entry.name))
    .map((entry) => ({
      file: `src/${entry.name}`,
      rule: 'FE-LAYER-DIRECTION',
      message: 'Carpeta de primer nivel no declarada. Declárala en architecture.yaml o muévela a una capa.',
    }));
}

runWhenInvokedDirectly('check:architecture', collectArchitectureViolations, import.meta.url);
