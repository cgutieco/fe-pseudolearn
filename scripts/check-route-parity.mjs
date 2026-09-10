import { join } from 'node:path';
import { loadArchitectureConfig } from './lib/config.mjs';
import { listFiles, toPosixPath } from './lib/walk.mjs';
import { runWhenInvokedDirectly } from './lib/cli.mjs';

export function collectRouteParityViolations(rootDirectory) {
  const config = loadArchitectureConfig(rootDirectory);
  const prefix = config.routes.localePrefix;
  const routesDirectory = join(rootDirectory, config.routes.directory);
  const routes = listFiles(routesDirectory, ['.astro']).map((absolutePath) =>
    toPosixPath(rootDirectory, absolutePath).replace(`${config.routes.directory}/`, ''),
  );
  const defaultRoutes = routes.filter((route) => !route.startsWith(`${prefix}/`));
  const prefixedRoutes = new Set(
    routes.filter((route) => route.startsWith(`${prefix}/`)).map((route) => route.slice(prefix.length + 1)),
  );
  return [
    ...defaultRoutes
      .filter((route) => !isLocaleAgnostic(route) && !prefixedRoutes.has(route))
      .map((route) => ({
        file: `${config.routes.directory}/${prefix}/${route}`,
        rule: 'FE-ROUTE-PARITY',
        message: `La ruta "${route}" existe en el idioma por defecto y falta en "${prefix}".`,
      })),
    ...[...prefixedRoutes]
      .filter((route) => !defaultRoutes.includes(route))
      .map((route) => ({
        file: `${config.routes.directory}/${route}`,
        rule: 'FE-ROUTE-PARITY',
        message: `La ruta "${route}" existe en "${prefix}" y falta en el idioma por defecto.`,
      })),
  ];
}

function isLocaleAgnostic(route) {
  return route === '404.astro';
}

runWhenInvokedDirectly('check:routes', collectRouteParityViolations, import.meta.url);
