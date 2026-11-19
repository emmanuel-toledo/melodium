import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';

import ts from 'typescript';

import { architectureConfig } from './architecture.config.mjs';

const SOURCE_EXTENSIONS = ['.ts', '.tsx'];
const RESOLVE_SUFFIXES = ['', '.ts', '.tsx', '/index.ts', '/index.tsx'];
const JS_EXTENSIONS = ['.js', '.jsx'];

export function toPosix(path) {
  return path.split(sep).join('/');
}

export function listSourceFiles({ rootDir, config }) {
  const files = [];
  const srcDir = join(rootDir, config.srcDir);

  if (!existsSync(srcDir)) {
    return files;
  }

  const walk = (absoluteDir) => {
    for (const entry of readdirSync(absoluteDir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) {
        continue;
      }

      const absolutePath = join(absoluteDir, entry.name);

      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }

      if (SOURCE_EXTENSIONS.includes(extname(entry.name))) {
        files.push(absolutePath);
      }
    }
  };

  walk(srcDir);

  return files.sort();
}

function scriptKindFor(filePath) {
  return filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
}

export function parseSource({ rootDir, filePath }) {
  const content = readFileSync(filePath, 'utf8');
  const sourceFile = ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKindFor(filePath),
  );
  const dependencies = [];

  const addDependency = (node, specifier, kind, typeOnly) => {
    const position = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));

    dependencies.push({
      file: toPosix(relative(rootDir, filePath)),
      specifier,
      kind,
      typeOnly,
      line: position.line + 1,
      column: position.character + 1,
    });
  };

  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      addDependency(
        node,
        node.moduleSpecifier.text,
        'import',
        Boolean(node.importClause?.isTypeOnly),
      );
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      if (ts.isStringLiteral(node.moduleSpecifier)) {
        addDependency(node, node.moduleSpecifier.text, 'export', Boolean(node.isTypeOnly));
      }
    } else if (
      ts.isImportEqualsDeclaration(node) &&
      ts.isExternalModuleReference(node.moduleReference) &&
      ts.isStringLiteral(node.moduleReference.expression)
    ) {
      addDependency(node, node.moduleReference.expression.text, 'import', node.isTypeOnly);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length === 1 &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      addDependency(node, node.arguments[0].text, 'dynamic-import', false);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  return {
    file: toPosix(relative(rootDir, filePath)),
    absolutePath: filePath,
    sourceFile,
    dependencies,
  };
}

export function resolveSpecifier({ rootDir, config, fromFile, specifier }) {
  const candidates = [];

  if (specifier.startsWith('.')) {
    candidates.push(resolve(dirname(fromFile), specifier));
  } else {
    for (const [alias, target] of Object.entries(config.alias)) {
      if (specifier === alias) {
        candidates.push(join(rootDir, target));
        break;
      }

      if (specifier.startsWith(`${alias}/`)) {
        candidates.push(join(rootDir, target, specifier.slice(alias.length + 1)));
        break;
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  const base = candidates[0];
  const attempts = RESOLVE_SUFFIXES.map((suffix) => `${base}${suffix}`);

  for (const extension of JS_EXTENSIONS) {
    if (base.endsWith(extension)) {
      const withoutExtension = base.slice(0, -extension.length);
      attempts.push(`${withoutExtension}.ts`, `${withoutExtension}.tsx`);
    }
  }

  for (const attempt of attempts) {
    if (existsSync(attempt) && statSync(attempt).isFile()) {
      return attempt;
    }
  }

  return null;
}

export function collectDependencies({ rootDir, config = architectureConfig }) {
  return listSourceFiles({ rootDir, config }).flatMap((filePath) => {
    const source = parseSource({ rootDir, filePath });

    return source.dependencies.map((dependency) => {
      const resolved = resolveSpecifier({
        rootDir,
        config,
        fromFile: filePath,
        specifier: dependency.specifier,
      });

      return {
        ...dependency,
        resolvedFile: resolved ? toPosix(relative(rootDir, resolved)) : null,
      };
    });
  });
}

function layerOf(config, file) {
  for (const [layer, prefix] of Object.entries(config.layers)) {
    if (file === prefix || file.startsWith(`${prefix}/`)) {
      return layer;
    }
  }

  return null;
}

function featureOf(config, file) {
  const prefix = `${config.layers.features}/`;

  if (!file.startsWith(prefix)) {
    return null;
  }

  const [feature] = file.slice(prefix.length).split('/');

  return feature || null;
}

function reportOn(dependency, code, message) {
  return {
    code,
    file: dependency.file,
    line: dependency.line,
    column: dependency.column,
    message,
  };
}

function checkLayerDirection({ config, dependencies }) {
  const reports = [];

  for (const dependency of dependencies) {
    if (!dependency.resolvedFile) {
      continue;
    }

    const fromLayer = layerOf(config, dependency.file);
    const toLayer = layerOf(config, dependency.resolvedFile);

    if (fromLayer === 'shared' && (toLayer === 'app' || toLayer === 'features')) {
      reports.push(
        reportOn(dependency, 'ARCH001_LAYER_DIRECTION', `shared must not import ${toLayer}.`),
      );
      continue;
    }

    if (fromLayer === 'features' && toLayer === 'app') {
      reports.push(
        reportOn(dependency, 'ARCH001_LAYER_DIRECTION', 'features must not import app.'),
      );
    }
  }

  return reports;
}

function aliasPrefix(config, layer) {
  const [aliasKey, aliasTarget] = Object.entries(config.alias)[0];
  const layerPath = config.layers[layer];
  const relativePath = layerPath === aliasTarget ? '' : layerPath.slice(aliasTarget.length + 1);

  return relativePath ? `${aliasKey}/${relativePath}` : aliasKey;
}

function checkFeatureDeepImport({ config, dependencies }) {
  const reports = [];
  const featureRoot = aliasPrefix(config, 'features');

  for (const dependency of dependencies) {
    const fromLayer = layerOf(config, dependency.file);

    if (fromLayer !== 'app' && fromLayer !== 'features') {
      continue;
    }

    const fromFeature = featureOf(config, dependency.file);

    if (dependency.specifier === featureRoot) {
      reports.push(
        reportOn(
          dependency,
          'ARCH002_FEATURE_DEEP_IMPORT',
          'Import a feature through its public entry point.',
        ),
      );
      continue;
    }

    if (dependency.specifier.startsWith(`${featureRoot}/`)) {
      const rest = dependency.specifier.slice(featureRoot.length + 1);
      const [targetFeature] = rest.split('/');
      const isExactEntry = rest === targetFeature;

      if (isExactEntry) {
        continue;
      }

      if (fromFeature && targetFeature === fromFeature) {
        continue;
      }

      reports.push(
        reportOn(
          dependency,
          'ARCH002_FEATURE_DEEP_IMPORT',
          `Import the public entry @/features/${targetFeature} instead of an internal path.`,
        ),
      );
      continue;
    }

    if (!dependency.resolvedFile) {
      continue;
    }

    const targetFeature = featureOf(config, dependency.resolvedFile);

    if (!targetFeature || targetFeature === fromFeature) {
      continue;
    }

    reports.push(
      reportOn(
        dependency,
        'ARCH002_FEATURE_DEEP_IMPORT',
        `Import the public entry @/features/${targetFeature}; relative paths across features are not allowed.`,
      ),
    );
  }

  return reports;
}

function checkFeatureGraph({ config, dependencies, files }) {
  const reports = [];
  const graph = config.featureGraph;
  const knownFeatures = new Set(Object.keys(graph));
  const reportedUnknown = new Set();

  for (const source of files) {
    const feature = featureOf(config, source.file);

    if (feature && !knownFeatures.has(feature) && !reportedUnknown.has(feature)) {
      reportedUnknown.add(feature);
      reports.push({
        code: 'ARCH003_FEATURE_GRAPH',
        file: source.file,
        line: 1,
        column: 1,
        message: `Feature "${feature}" is missing from the architecture feature graph.`,
      });
    }
  }

  for (const dependency of dependencies) {
    if (!dependency.resolvedFile) {
      continue;
    }

    const fromFeature = featureOf(config, dependency.file);
    const toFeature = featureOf(config, dependency.resolvedFile);

    if (!fromFeature || !toFeature || fromFeature === toFeature) {
      continue;
    }

    const allowedTargets = graph[fromFeature] ?? [];

    if (!allowedTargets.includes(toFeature)) {
      reports.push(
        reportOn(
          dependency,
          'ARCH003_FEATURE_GRAPH',
          `Feature "${fromFeature}" must not import "${toFeature}".`,
        ),
      );
    }
  }

  return reports;
}

function checkImportCycles({ dependencies }) {
  const reports = [];
  const edges = new Map();
  const state = new Map();
  const stack = [];
  const seenCycles = new Set();

  for (const dependency of dependencies) {
    if (!dependency.resolvedFile) {
      continue;
    }

    if (!edges.has(dependency.file)) {
      edges.set(dependency.file, []);
    }

    edges.get(dependency.file).push(dependency);
  }

  const visit = (file) => {
    state.set(file, 'visiting');
    stack.push(file);

    for (const dependency of edges.get(file) ?? []) {
      const target = dependency.resolvedFile;

      if (!edges.has(target)) {
        continue;
      }

      const targetState = state.get(target);

      if (!targetState) {
        visit(target);
        continue;
      }

      if (targetState !== 'visiting') {
        continue;
      }

      const cycleStart = stack.indexOf(target);
      const cycle = stack.slice(cycleStart);
      const cycleKey = [...cycle].sort().join('|');

      if (seenCycles.has(cycleKey)) {
        continue;
      }

      seenCycles.add(cycleKey);
      reports.push(
        reportOn(dependency, 'ARCH004_CYCLE', `Import cycle: ${[...cycle, target].join(' -> ')}`),
      );
    }

    stack.pop();
    state.set(file, 'done');
  };

  for (const file of [...edges.keys()].sort()) {
    if (!state.get(file)) {
      visit(file);
    }
  }

  return reports;
}

function checkFeatureCycles({ config, dependencies }) {
  const reports = [];
  const edges = new Map();
  const state = new Map();
  const stack = [];
  const seenCycles = new Set();

  for (const dependency of dependencies) {
    if (!dependency.resolvedFile) {
      continue;
    }

    const fromFeature = featureOf(config, dependency.file);
    const toFeature = featureOf(config, dependency.resolvedFile);

    if (!fromFeature || !toFeature || fromFeature === toFeature) {
      continue;
    }

    if (!edges.has(fromFeature)) {
      edges.set(fromFeature, []);
    }

    edges.get(fromFeature).push({ target: toFeature, dependency });
  }

  const visit = (feature) => {
    state.set(feature, 'visiting');
    stack.push(feature);

    for (const { target, dependency } of edges.get(feature) ?? []) {
      const targetState = state.get(target);

      if (!targetState) {
        visit(target);
        continue;
      }

      if (targetState !== 'visiting') {
        continue;
      }

      const cycleStart = stack.indexOf(target);
      const cycle = stack.slice(cycleStart);
      const cycleKey = [...cycle].sort().join('|');

      if (seenCycles.has(cycleKey)) {
        continue;
      }

      seenCycles.add(cycleKey);
      reports.push(
        reportOn(dependency, 'ARCH004_CYCLE', `Feature cycle: ${[...cycle, target].join(' -> ')}`),
      );
    }

    stack.pop();
    state.set(feature, 'done');
  };

  for (const feature of [...edges.keys()].sort()) {
    if (!state.get(feature)) {
      visit(feature);
    }
  }

  return reports;
}

function isFirebaseSpecifier(specifier) {
  return (
    specifier === 'firebase' ||
    specifier.startsWith('firebase/') ||
    specifier.startsWith('@firebase/')
  );
}

function checkFirebaseBoundary({ config, dependencies }) {
  const reports = [];
  const firebaseDir = `${config.firebaseBoundary}/`;

  for (const dependency of dependencies) {
    if (!isFirebaseSpecifier(dependency.specifier)) {
      continue;
    }

    if (dependency.file === config.firebaseBoundary || dependency.file.startsWith(firebaseDir)) {
      continue;
    }

    reports.push(
      reportOn(
        dependency,
        'ARCH005_FIREBASE_BOUNDARY',
        `Import Firebase only inside ${config.firebaseBoundary}.`,
      ),
    );
  }

  return reports;
}

function checkEnvBoundary({ config, files }) {
  const reports = [];

  for (const source of files) {
    if (source.file === config.envBoundary) {
      continue;
    }

    const visit = (node) => {
      if (
        ts.isMetaProperty(node) &&
        node.keywordToken === ts.SyntaxKind.ImportKeyword &&
        node.name.text === 'meta'
      ) {
        const { parent } = node;
        let access = null;

        if (
          ts.isPropertyAccessExpression(parent) &&
          parent.expression === node &&
          parent.name.text === 'env'
        ) {
          access = parent;
        } else if (
          ts.isElementAccessExpression(parent) &&
          parent.expression === node &&
          ts.isStringLiteral(parent.argumentExpression) &&
          parent.argumentExpression.text === 'env'
        ) {
          access = parent;
        }

        if (access) {
          const position = source.sourceFile.getLineAndCharacterOfPosition(
            access.getStart(source.sourceFile),
          );

          reports.push({
            code: 'ARCH006_ENV_BOUNDARY',
            file: source.file,
            line: position.line + 1,
            column: position.character + 1,
            message: `Read import.meta.env only in ${config.envBoundary}.`,
          });
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(source.sourceFile);
  }

  return reports;
}

function checkInternalBarrels({ config, files }) {
  const reports = [];
  const featuresPrefix = `${config.layers.features}/`;

  for (const source of files) {
    if (!source.file.startsWith(featuresPrefix)) {
      continue;
    }

    const feature = featureOf(config, source.file);
    const fileName = source.file.split('/').pop();

    if (fileName !== 'index.ts' && fileName !== 'index.tsx') {
      continue;
    }

    if (source.file === `${featuresPrefix}${feature}/index.ts`) {
      continue;
    }

    reports.push({
      code: 'ARCH007_INTERNAL_BARREL',
      file: source.file,
      line: 1,
      column: 1,
      message: `Only ${featuresPrefix}${feature}/index.ts may be a barrel.`,
    });
  }

  return reports;
}

const EFFECT_HOOKS = new Set(['useEffect', 'useLayoutEffect', 'useInsertionEffect']);

function readEffectsRegistry({ rootDir, config }) {
  const registryPath = join(rootDir, config.effectsRegistry);

  if (!existsSync(registryPath)) {
    return [];
  }

  const lines = readFileSync(registryPath, 'utf8').split('\n');
  const entries = [];
  let columns = null;

  lines.forEach((line, index) => {
    if (!line.trim().startsWith('|')) {
      columns = null;
      return;
    }

    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());

    if (!columns) {
      columns = cells.map((cell) => cell.toLowerCase());
      return;
    }

    if (cells.every((cell) => cell === '' || /^-+$/.test(cell))) {
      return;
    }

    const idIndex = columns.indexOf('id');
    const fileIndex = columns.indexOf('file');
    const hookIndex = columns.indexOf('hook');
    const testIndex = columns.indexOf('test');

    if (idIndex === -1 || fileIndex === -1 || hookIndex === -1 || testIndex === -1) {
      return;
    }

    const id = cells[idIndex];

    if (!/^EFF-\d+$/.test(id)) {
      return;
    }

    entries.push({
      id,
      file: cells[fileIndex],
      hook: cells[hookIndex],
      test: cells[testIndex],
      line: index + 1,
    });
  });

  return entries;
}

function effectImportsOf(sourceFile) {
  const named = new Map();
  const namespaces = new Set();

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) {
      continue;
    }

    if (statement.moduleSpecifier.text !== 'react') {
      continue;
    }

    const bindings = statement.importClause?.namedBindings;

    if (!bindings) {
      continue;
    }

    if (ts.isNamedImports(bindings)) {
      for (const element of bindings.elements) {
        const imported = (element.propertyName ?? element.name).text;

        if (EFFECT_HOOKS.has(imported)) {
          named.set(element.name.text, imported);
        }
      }
    } else if (ts.isNamespaceImport(bindings)) {
      namespaces.add(bindings.name.text);
    }
  }

  return { named, namespaces };
}

function hookOfCall(call, imports) {
  const callee = call.expression;

  if (ts.isIdentifier(callee)) {
    if (imports.named.has(callee.text)) {
      return imports.named.get(callee.text);
    }

    return EFFECT_HOOKS.has(callee.text) ? callee.text : null;
  }

  if (
    ts.isPropertyAccessExpression(callee) &&
    ts.isIdentifier(callee.expression) &&
    imports.namespaces.has(callee.expression.text) &&
    EFFECT_HOOKS.has(callee.name.text)
  ) {
    return callee.name.text;
  }

  return null;
}

function markerIdAt(sourceFile, line) {
  const lineStarts = sourceFile.getLineStarts();
  const start = lineStarts[line - 1];
  const end = line < lineStarts.length ? lineStarts[line] : sourceFile.getFullText().length;
  const match = sourceFile
    .getFullText()
    .slice(start, end)
    .match(/effect:\s*(EFF-\d+)/);

  return match ? match[1] : null;
}

function checkEffectApprovals({ rootDir, config, files }) {
  const reports = [];
  const registry = readEffectsRegistry({ rootDir, config });
  const registryById = new Map(registry.map((entry) => [entry.id, entry]));
  const usedIds = new Set();

  for (const source of files) {
    const imports = effectImportsOf(source.sourceFile);

    const visit = (node) => {
      if (ts.isCallExpression(node)) {
        const hook = hookOfCall(node, imports);

        if (hook) {
          const position = source.sourceFile.getLineAndCharacterOfPosition(
            node.getStart(source.sourceFile),
          );
          const line = position.line + 1;
          const column = position.character + 1;
          const id = markerIdAt(source.sourceFile, line);
          const report = (message) =>
            reports.push({
              code: 'ARCH008_EFFECT_APPROVAL',
              file: source.file,
              line,
              column,
              message,
            });

          if (!id) {
            report('Effect call requires an inline // effect: EFF-XXX marker.');
          } else {
            const entry = registryById.get(id);

            usedIds.add(id);

            if (!entry) {
              report(`Effect ${id} has no approval row in ${config.effectsRegistry}.`);
            } else if (entry.file !== source.file || entry.hook !== hook) {
              report(
                `Effect ${id} is approved for ${entry.file} (${entry.hook}), not for ${source.file} (${hook}).`,
              );
            }
          }
        }
      }

      ts.forEachChild(node, visit);
    };

    visit(source.sourceFile);
  }

  for (const entry of registry) {
    if (!usedIds.has(entry.id)) {
      reports.push({
        code: 'ARCH008_EFFECT_APPROVAL',
        file: config.effectsRegistry,
        line: entry.line,
        column: 1,
        message: `Approval row ${entry.id} has no matching effect call.`,
      });
    }

    if (!existsSync(join(rootDir, entry.test))) {
      reports.push({
        code: 'ARCH008_EFFECT_APPROVAL',
        file: config.effectsRegistry,
        line: entry.line,
        column: 1,
        message: `Approval row ${entry.id} points to a missing test file ${entry.test}.`,
      });
    }
  }

  return reports;
}

function checkFeatureRoots({ config, files }) {
  const reports = [];
  const featuresPrefix = `${config.layers.features}/`;
  const features = new Set();

  for (const source of files) {
    const feature = featureOf(config, source.file);

    if (feature) {
      features.add(feature);
    }
  }

  for (const feature of [...features].sort()) {
    if (files.some((source) => source.file === `${featuresPrefix}${feature}/index.ts`)) {
      continue;
    }

    reports.push({
      code: 'ARCH009_FEATURE_ROOT',
      file: `${featuresPrefix}${feature}`,
      line: 1,
      column: 1,
      message: `Feature "${feature}" needs a root index.ts.`,
    });
  }

  return reports;
}

const defaultChecks = [
  checkLayerDirection,
  checkFeatureDeepImport,
  checkFeatureGraph,
  checkImportCycles,
  checkFeatureCycles,
  checkFirebaseBoundary,
  checkEnvBoundary,
  checkInternalBarrels,
  checkEffectApprovals,
  checkFeatureRoots,
];

export function runChecks({ rootDir, config = architectureConfig, checks = defaultChecks }) {
  const files = listSourceFiles({ rootDir, config }).map((filePath) =>
    parseSource({ rootDir, filePath }),
  );
  const dependencies = collectDependencies({ rootDir, config });
  const context = { rootDir, config, files, dependencies };

  return checks
    .flatMap((check) => check(context))
    .sort((left, right) => {
      if (left.file !== right.file) {
        return left.file.localeCompare(right.file);
      }

      return left.line - right.line || left.column - right.column;
    });
}

function reportLocation(report) {
  return `${report.file}:${report.line}:${report.column}`;
}

function main() {
  const reports = runChecks({ rootDir: process.cwd(), config: architectureConfig });

  if (reports.length === 0) {
    process.stdout.write('Architecture check passed.\n');
    return;
  }

  for (const report of reports) {
    process.stderr.write(`${reportLocation(report)}  ${report.code}  ${report.message}\n`);
  }

  process.stderr.write(`${reports.length} architecture violation(s) found.\n`);
  process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main();
}
