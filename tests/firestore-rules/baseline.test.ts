import { assertFails } from '@firebase/rules-unit-testing';
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

import { createRulesTestEnvironment, cleanupRulesTestEnvironment } from './helpers';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await createRulesTestEnvironment();
});

afterAll(async () => {
  await cleanupRulesTestEnvironment(testEnv);
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

const paths = [
  ['compositions', 'users/alice/compositions/song-1'],
  ['setlists', 'users/alice/setlists/list-1'],
] as const;

describe.each(paths)('%s baseline', (_name, path) => {
  it('denies anonymous reads', async () => {
    const context = testEnv.unauthenticatedContext();

    await assertFails(context.firestore().doc(path).get());
  });

  it('denies anonymous writes', async () => {
    const context = testEnv.unauthenticatedContext();

    await assertFails(context.firestore().doc(path).set({ title: 'Anónimo' }));
  });

  it('denies reads by the owner', async () => {
    const context = testEnv.authenticatedContext('alice');

    await assertFails(context.firestore().doc(path).get());
  });

  it('denies writes by the owner', async () => {
    const context = testEnv.authenticatedContext('alice');

    await assertFails(context.firestore().doc(path).set({ title: 'Propietario' }));
  });
});
