// @vitest-environment node

import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { architectureConfig } from './architecture.config.mjs';
import { collectDependencies, runChecks } from './check-architecture.mjs';

const validRoot = fileURLToPath(new URL('./fixtures/architecture/valid', import.meta.url));

function fixtureRoot(name) {
  return fileURLToPath(new URL(`./fixtures/architecture/${name}`, import.meta.url));
}

function reportsFor(name) {
  return runChecks({ rootDir: fixtureRoot(name), config: architectureConfig });
}

describe('architecture checker core', () => {
  it('reports no violations for the valid fixture', () => {
    expect(runChecks({ rootDir: validRoot, config: architectureConfig })).toEqual([]);
  });

  it('collects static, type-only, re-export and dynamic dependencies', () => {
    const dependencies = collectDependencies({
      rootDir: validRoot,
      config: architectureConfig,
    }).filter((dependency) => dependency.file === 'src/shared/lib/imports.ts');

    expect(dependencies.map(({ kind, typeOnly }) => (typeOnly ? `${kind}:type` : kind))).toEqual([
      'import',
      'import:type',
      'export',
      'export:type',
      'dynamic-import',
    ]);

    expect(
      dependencies.every(({ resolvedFile }) => resolvedFile === 'src/shared/lib/helper.ts'),
    ).toBe(true);
  });

  it('resolves the @ alias and reports positions', () => {
    const dependencies = collectDependencies({
      rootDir: validRoot,
      config: architectureConfig,
    }).filter((dependency) => dependency.file === 'src/app/main.ts');

    expect(dependencies).toHaveLength(1);
    expect(dependencies[0]).toMatchObject({
      specifier: '@/shared/lib/utils',
      resolvedFile: 'src/shared/lib/utils.ts',
      line: 1,
      column: 1,
    });
  });
});

describe('ARCH001 layer direction', () => {
  it('rejects shared to app, shared to feature and feature to app', () => {
    const reports = reportsFor('arch001');

    expect(reports.map(({ code, file, line, column }) => ({ code, file, line, column }))).toEqual([
      {
        code: 'ARCH001_LAYER_DIRECTION',
        file: 'src/features/compositions/index.ts',
        line: 1,
        column: 1,
      },
      { code: 'ARCH001_LAYER_DIRECTION', file: 'src/shared/lib/to-app.ts', line: 1, column: 1 },
      {
        code: 'ARCH001_LAYER_DIRECTION',
        file: 'src/shared/lib/to-feature.ts',
        line: 1,
        column: 1,
      },
    ]);
  });
});

describe('ARCH002 feature deep imports', () => {
  it('rejects alias subpaths, internal imports and relative cross-feature imports', () => {
    const reports = reportsFor('arch002');

    expect(reports.map(({ code, file, line, column }) => ({ code, file, line, column }))).toEqual([
      { code: 'ARCH002_FEATURE_DEEP_IMPORT', file: 'src/app/main.ts', line: 1, column: 1 },
      { code: 'ARCH002_FEATURE_DEEP_IMPORT', file: 'src/app/relative.ts', line: 1, column: 1 },
      {
        code: 'ARCH002_FEATURE_DEEP_IMPORT',
        file: 'src/features/compositions/index.ts',
        line: 1,
        column: 1,
      },
    ]);
  });

  it('accepts the exact public entry point and same-feature relative imports', () => {
    const reports = reportsFor('arch002');

    expect(reports.some((report) => report.file === 'src/features/setlists/index.ts')).toBe(false);
    expect(reports.some((report) => report.file === 'src/features/auth/lib/sibling.ts')).toBe(
      false,
    );
  });
});

describe('ARCH003 feature graph', () => {
  it('rejects disallowed feature edges and features missing from the graph', () => {
    const reports = reportsFor('arch003');

    expect(reports.map(({ code, file, line, column }) => ({ code, file, line, column }))).toEqual([
      {
        code: 'ARCH003_FEATURE_GRAPH',
        file: 'src/features/auth/forbidden.ts',
        line: 1,
        column: 1,
      },
      {
        code: 'ARCH003_FEATURE_GRAPH',
        file: 'src/features/payments/index.ts',
        line: 1,
        column: 1,
      },
    ]);
  });
});

describe('ARCH004 cycles', () => {
  it('detects file cycles that include type-only imports', () => {
    const reports = reportsFor('arch004').filter((report) => report.code === 'ARCH004_CYCLE');

    expect(reports).toHaveLength(1);
    expect(reports[0]).toMatchObject({
      file: 'src/shared/lib/b.ts',
      line: 1,
      column: 1,
    });
    expect(reports[0].message).toContain('Import cycle:');
  });

  it('detects feature cycles', () => {
    const reports = reportsFor('arch004-feature').filter(
      (report) => report.code === 'ARCH004_CYCLE',
    );
    const featureCycle = reports.find((report) => report.message.startsWith('Feature cycle:'));

    expect(featureCycle).toBeDefined();
    expect(featureCycle.message).toContain('auth');
    expect(featureCycle.message).toContain('compositions');
  });
});

describe('ARCH005 Firebase boundary', () => {
  it('allows the facade and rejects Firebase imports elsewhere', () => {
    const reports = reportsFor('arch005');

    expect(reports.map(({ code, file, line }) => ({ code, file, line }))).toEqual([
      { code: 'ARCH005_FIREBASE_BOUNDARY', file: 'src/app/main.ts', line: 1 },
      { code: 'ARCH005_FIREBASE_BOUNDARY', file: 'src/shared/lib/use-firebase.ts', line: 1 },
    ]);
  });
});

describe('ARCH006 environment boundary', () => {
  it('allows env.ts and rejects import.meta.env property and element access elsewhere', () => {
    const reports = reportsFor('arch006');

    expect(reports.map(({ code, file, line }) => ({ code, file, line }))).toEqual([
      { code: 'ARCH006_ENV_BOUNDARY', file: 'src/shared/lib/read-env-bracket.ts', line: 1 },
      { code: 'ARCH006_ENV_BOUNDARY', file: 'src/shared/lib/read-env.ts', line: 1 },
    ]);
  });
});

describe('ARCH007 internal barrels', () => {
  it('allows only the feature root index.ts', () => {
    const reports = reportsFor('arch007');

    expect(reports.map(({ code, file, line }) => ({ code, file, line }))).toEqual([
      { code: 'ARCH007_INTERNAL_BARREL', file: 'src/features/auth/lib/index.ts', line: 1 },
      { code: 'ARCH007_INTERNAL_BARREL', file: 'src/features/compositions/ui/index.ts', line: 1 },
    ]);
  });
});

describe('ARCH008 effect approvals', () => {
  it('rejects unapproved, unknown, mismatched, stale and untested effects', () => {
    const reports = reportsFor('arch008');

    expect(reports.map(({ code, file, line }) => ({ code, file, line }))).toEqual([
      { code: 'ARCH008_EFFECT_APPROVAL', file: 'docs/decisions/effects.md', line: 9 },
      { code: 'ARCH008_EFFECT_APPROVAL', file: 'docs/decisions/effects.md', line: 10 },
      { code: 'ARCH008_EFFECT_APPROVAL', file: 'src/app/aliased.tsx', line: 4 },
      { code: 'ARCH008_EFFECT_APPROVAL', file: 'src/app/effect.tsx', line: 4 },
      { code: 'ARCH008_EFFECT_APPROVAL', file: 'src/app/mismatch.tsx', line: 4 },
    ]);
  });

  it('accepts a marked effect with a matching row and test file', () => {
    const reports = reportsFor('arch008');

    expect(reports.some((report) => report.file === 'src/app/namespace.tsx')).toBe(false);
  });
});

describe('ARCH009 feature roots', () => {
  it('requires index.ts for features with source files and ignores empty directories', () => {
    const reports = reportsFor('arch009');

    expect(reports.map(({ code, file, line }) => ({ code, file, line }))).toEqual([
      { code: 'ARCH009_FEATURE_ROOT', file: 'src/features/compositions', line: 1 },
    ]);
  });
});
