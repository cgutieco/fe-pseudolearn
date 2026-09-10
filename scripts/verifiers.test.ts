import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { collectArchitectureViolations } from './check-architecture.mjs';
import { collectI18nViolations } from './check-i18n.mjs';
import { collectHardcodedTextViolations } from './check-hardcoded-text.mjs';
import { collectRouteParityViolations } from './check-route-parity.mjs';
import { collectCommentViolations } from './check-no-comments.mjs';
import { collectCssScopeViolations } from './check-css-scope.mjs';
import { collectSizeViolations } from './check-size.mjs';
import { collectBrandViolations } from './check-brand.mjs';

const scriptsDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(scriptsDirectory, '..');

function fixture(name: string): string {
  return join(scriptsDirectory, '__fixtures__', name);
}

function rules(violations: { rule: string }[]): string[] {
  return violations.map((violation) => violation.rule);
}

describe('check-architecture', () => {
  it('passes on the real project', () => {
    expect(collectArchitectureViolations(projectRoot)).toEqual([]);
  });

  it('rejects an import that climbs to a more specific layer', () => {
    const violations = collectArchitectureViolations(fixture('layer-violation'));
    expect(rules(violations)).toContain('FE-LAYER-DIRECTION');
  });

  it('rejects a route wrapper that outgrew its line budget', () => {
    const violations = collectArchitectureViolations(fixture('fat-route'));
    expect(rules(violations)).toContain('FE-THIN-ROUTES');
  });
});

describe('check-no-comments', () => {
  it('passes on the real project', () => {
    expect(collectCommentViolations(projectRoot)).toEqual([]);
  });

  it('rejects a prose comment', () => {
    const violations = collectCommentViolations(fixture('commented'));
    expect(rules(violations)).toEqual(['FE-NO-COMMENTS']);
  });

  it('does not mistake a double slash inside a string for a comment', () => {
    const violations = collectCommentViolations(fixture('commented'));
    expect(violations.every((violation) => !violation.file.endsWith('tricky.ts'))).toBe(true);
  });
});

describe('check-css-scope', () => {
  it('passes on the real project', () => {
    expect(collectCssScopeViolations(projectRoot)).toEqual([]);
  });

  it('rejects an unprefixed class in a global stylesheet', () => {
    const violations = collectCssScopeViolations(fixture('unprefixed-global'));
    expect(rules(violations)).toEqual(['FE-CSS-NAMESPACE']);
  });
});

describe('check-hardcoded-text', () => {
  it('passes on the real project', () => {
    expect(collectHardcodedTextViolations(projectRoot)).toEqual([]);
  });

  it('rejects a literal text node in a template', () => {
    const violations = collectHardcodedTextViolations(fixture('hardcoded-text'));
    expect(rules(violations)).toEqual(['FE-NO-HARDCODED-TEXT']);
  });
});

describe('check-route-parity', () => {
  it('passes on the real project', () => {
    expect(collectRouteParityViolations(projectRoot)).toEqual([]);
  });

  it('rejects a route that exists in only one language', () => {
    const violations = collectRouteParityViolations(fixture('missing-route'));
    expect(rules(violations)).toEqual(['FE-ROUTE-PARITY']);
  });
});

describe('check-size', () => {
  it('passes on the real project', () => {
    expect(collectSizeViolations(projectRoot)).toEqual([]);
  });

  it('rejects a component past its line budget', () => {
    const violations = collectSizeViolations(fixture('oversized'));
    expect(rules(violations)).toContain('FE-SIZE-ASTRO-FILE');
  });
});

describe('check-i18n', () => {
  it('passes on the real project', () => {
    expect(collectI18nViolations(projectRoot)).toEqual([]);
  });

  it('rejects dictionaries whose key sets differ', () => {
    const violations = collectI18nViolations(fixture('broken-i18n'));
    expect(rules(violations)).toContain('FE-I18N-PARITY');
    expect(violations.some((violation) => violation.message.includes('a.two'))).toBe(true);
  });
});

describe('check-brand', () => {
  it('passes on the real project', () => {
    expect(collectBrandViolations(projectRoot)).toEqual([]);
  });

  it('rejects brand path data pasted into a component', () => {
    const violations = collectBrandViolations(fixture('pasted-brand'));
    expect(rules(violations)).toEqual(['FE-BRAND-GENERATED']);
  });
});
