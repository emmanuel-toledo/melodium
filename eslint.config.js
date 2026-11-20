import js from '@eslint/js';
import boundaries from 'eslint-plugin-boundaries';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const firebaseSdkPatterns = ['firebase', 'firebase/*', '@firebase/*'];
const firebaseFacadePatterns = ['@/shared/lib/firebase', '@/shared/lib/firebase/*'];
const featureEntryPatterns = ['@/features/*', '@/features/*/**'];

export default tseslint.config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.husky/_/**',
      'coverage/**',
      '.firebase/**',
      'scripts/fixtures/**',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      boundaries,
      'react-hooks': reactHooks,
    },
    settings: {
      'boundaries/root-path': import.meta.dirname,
      'boundaries/include': ['src/**/*'],
      'boundaries/elements': [
        { type: 'app', pattern: 'src/app' },
        { type: 'feature', pattern: 'src/features/*', capture: ['feature'] },
        { type: 'shared', pattern: 'src/shared' },
      ],
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      ...reactHooks.configs.flat.recommended.rules,
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'app' } },
              allow: { to: { element: { types: ['feature', 'shared'] } } },
            },
            {
              from: { element: { type: 'feature' } },
              allow: { to: { element: { types: ['feature', 'shared'] } } },
            },
          ],
        },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: 'dangerouslySetInnerHTML is not allowed.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: firebaseSdkPatterns,
              message: 'Import Firebase only through @/shared/lib/firebase.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: firebaseSdkPatterns,
              message: 'Import Firebase only through @/shared/lib/firebase.',
            },
            {
              group: firebaseFacadePatterns,
              message: 'The app layer must not import the Firebase facade.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/config/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: firebaseSdkPatterns,
              message: 'Import Firebase only through @/shared/lib/firebase.',
            },
            {
              group: firebaseFacadePatterns,
              message: 'App configuration must not import Firebase.',
            },
            {
              group: featureEntryPatterns,
              message: 'App configuration must not import features.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.{ts,tsx}'],
    ignores: ['src/features/*/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: firebaseSdkPatterns,
              message: 'Import Firebase only through @/shared/lib/firebase.',
            },
            {
              group: firebaseFacadePatterns,
              message: 'Features import the facade only from their api/ modules.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/*/api/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['src/shared/lib/firebase/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
  {
    files: ['tests/firestore-rules/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['firebase', 'firebase/*', '@firebase/*', '!@firebase/rules-unit-testing'],
              message:
                'The rules test harness may import @firebase/rules-unit-testing; all other Firebase SDK imports stay in @/shared/lib/firebase.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  prettier,
);
