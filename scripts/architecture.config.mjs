export const architectureConfig = {
  srcDir: 'src',
  alias: {
    '@': 'src',
  },
  layers: {
    app: 'src/app',
    features: 'src/features',
    shared: 'src/shared',
  },
  featureGraph: {
    auth: [],
    compositions: ['auth'],
    setlists: ['auth', 'compositions'],
  },
  envBoundary: 'src/shared/config/env.ts',
  firebaseBoundary: 'src/shared/lib/firebase',
  effectsRegistry: 'docs/decisions/effects.md',
};
