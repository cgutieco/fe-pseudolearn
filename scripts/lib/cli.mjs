import { argv } from 'node:process';
import { realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function reportViolations(checkName, violations) {
  if (violations.length === 0) {
    console.log(`✔ ${checkName}`);
    return 0;
  }
  console.error(`✖ ${checkName} — ${violations.length} violación(es)`);
  for (const violation of violations) {
    const location = violation.line ? `${violation.file}:${violation.line}` : violation.file;
    console.error(`  ${location}\n    [${violation.rule}] ${violation.message}`);
  }
  return 1;
}

export function isEntryPoint(moduleUrl) {
  if (!argv[1]) return false;
  return moduleUrl === pathToFileURL(realpathSync(argv[1])).href;
}

export function runWhenInvokedDirectly(checkName, collect, moduleUrl) {
  if (moduleUrl && !isEntryPoint(moduleUrl)) return;
  process.exitCode = reportViolations(checkName, collect(process.cwd()));
}
