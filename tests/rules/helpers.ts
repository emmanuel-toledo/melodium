import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { initializeTestEnvironment } from '@firebase/rules-unit-testing';
import type { RulesTestEnvironment } from '@firebase/rules-unit-testing';

export const RULES_TEST_PROJECT_ID = 'demo-melodium';
export const FIRESTORE_EMULATOR_HOST = '127.0.0.1';
export const FIRESTORE_EMULATOR_PORT = 8080;

const rulesPath = fileURLToPath(new URL('../../firestore.rules', import.meta.url));

export function readFirestoreRules(): string {
  return readFileSync(rulesPath, 'utf8');
}

export function createRulesTestEnvironment(): Promise<RulesTestEnvironment> {
  return initializeTestEnvironment({
    projectId: RULES_TEST_PROJECT_ID,
    firestore: {
      rules: readFirestoreRules(),
      host: FIRESTORE_EMULATOR_HOST,
      port: FIRESTORE_EMULATOR_PORT,
    },
  });
}

export function cleanupRulesTestEnvironment(environment: RulesTestEnvironment): Promise<void> {
  return environment.cleanup();
}
