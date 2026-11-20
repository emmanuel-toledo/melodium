# Firebase and data

## Environment

`src/shared/config/env.ts` is the only module that reads `import.meta.env`.

- Validate `VITE_FIREBASE_*` and `VITE_USE_FIREBASE_EMULATORS` with Zod.
- Export a validated, typed configuration object.
- Never read `import.meta.env` in a feature, component, hook or `src/app`.
- Never commit `.env.local`, secrets or service credentials.

## Firebase client

`src/shared/lib/firebase` owns all SDK imports:

- `initializeApp`.
- `auth` and `db` instances.
- Emulator wiring when `VITE_USE_FIREBASE_EMULATORS` is enabled.
- A curated re-export of the Firebase functions and types that features need.

Feature code imports Firebase functions and instances from `@/shared/lib/firebase`; it does **not** import from `firebase/*` or `@firebase/*` directly. This keeps the SDK surface in one place and makes unit tests mock a single module.

If a feature needs a Firebase function that is not re-exported yet, add it to the shared Firebase facade with a clear reason. Do not bypass the facade.

## Feature data access

Each feature owns its Firestore collection. Access belongs in its `api/` folder, and files end in `.api.ts`:

```text
src/features/compositions/api/
  compositions-service.api.ts   # collection path, queries, writes
  composition-mapper.ts         # Firestore document <-> domain type
```

```ts
// src/features/compositions/api/compositions-service.api.ts
import {
  db,
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from '@/shared/lib/firebase';

import type { Composition, CompositionInput } from '../interfaces/composition.interface';
import { toComposition } from '../lib/composition-mapper';

const compositionsRef = (uid: string) =>
  collection(db, 'users', uid, 'compositions');

export function subscribeToCompositions(uid: string, onNext: (items: Composition[]) => void) {
  const q = query(compositionsRef(uid), where('instrument', '==', 'guitar'));
  return onSnapshot(q, (snapshot) => {
    onNext(snapshot.docs.map((doc) => toComposition(doc.id, doc.data())));
  });
}

export async function createComposition(uid: string, input: CompositionInput) {
  return addDoc(compositionsRef(uid), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
```

The exact API will be defined by the compositions spec. The important boundaries are:

- `api/` imports from `@/shared/lib/firebase` and nothing else from the SDK.
- `api/` owns collection paths and mappers.
- Stores live in `stores/*.store.ts`; hooks call `api/` and the store.
- Components call hooks and never import Firebase or the shared Firebase client.

The auth feature is the reference: `api/auth-service.api.ts` wraps Firebase Auth, `stores/auth.store.ts` holds the session and `hooks/use-auth.ts` selects from it.

## Ownership

| Collection | Owner | Who may write |
| --- | --- | --- |
| `users/{uid}/compositions/{id}` | `compositions` feature | `compositions` only |
| `users/{uid}/setlists/{id}` | `setlists` feature | `setlists` only |

- No feature writes another feature's collection.
- `setlists` stores composition IDs and resolves title/artist through the public API of `compositions`. It does not duplicate composition data.
- When a composition is deleted, it must not leave a stale ID in the user's setlists. The spec must choose the coordination mechanism: `setlists` reconciles its IDs against the public API of `compositions`, or `src/app` orchestrates the two operations. Do not add a `compositions → setlists` dependency or let `compositions` write the setlists collection.
- Auth manages the session. It does not write compositions or setlists.

## Data model

The spec and Zod schemas are the source of truth. The summary in `AGENTS.md` is only an index.

```text
users/{uid}/compositions/{compositionId}
  title: string
  artist?: string
  key?: string
  capo?: number
  tempo?: number
  timeSignature?: string
  tuning?: string
  tags: string[]
  instrument: 'guitar'
  content: string          # ChordPro source of truth
  createdAt, updatedAt: Timestamp

users/{uid}/setlists/{setlistId}
  name: string
  compositionIds: string[] # ordered
  createdAt, updatedAt: Timestamp
```

Rules:

- Validate inputs with Zod at the boundary; schemas live in `lib/`.
- Derive types with `z.infer`.
- Normalize tags to lowercase, trim them and remove duplicates.
- Convert `Timestamp` to `Date` at display time.
- Do not persist rendered HTML or the result of transposition.
- Keep `content` as the original ChordPro source; render from the parsed model.

## Reads and subscriptions

- Prefer `onSnapshot` for the user's library and setlists.
- Encapsulate subscriptions in feature hooks.
- Return an unsubscribe function from the subscription and clean it up.
- The React skill describes `useSyncExternalStore` as the preferred adapter for external subscriptions.
- A one-time read is a feature `api/` function invoked by a hook or a route loader; do not fetch directly in a component.
- Search and filters run in the client over the user's library. No external search service or full-text index.

## Writes and errors

- All writes go through a feature `api/` function.
- Validate the payload with the feature's Zod schema before writing.
- Set `createdAt` and `updatedAt` with server timestamps.
- Map Firebase errors to user-facing messages in Spanish.
- Do not use empty `catch` blocks or `console.log`.
- Do not expose raw Firebase error codes in the UI.

## Tests

- Application tests mock `@/shared/lib/firebase`.
- Component tests use feature hooks and mocked data; they never talk to a real project.
- Firestore rules tests live in `tests/firestore-rules/` and use the emulators.
- Rules are deny-by-default; only the owner reads and writes.
- Test ownership, not just happy paths: a user must not read or write another user's documents.

## Anti-patterns

| Anti-pattern | Why it is wrong |
| --- | --- |
| `import { getFirestore } from 'firebase/firestore'` in a feature | Bypasses the shared Firebase facade |
| `import { db } from '@/shared/lib/firebase'` in a component | UI knows infrastructure |
| `collection(db, 'users', uid, 'setlists')` in `compositions` | Cross-feature write |
| Duplicating composition title/artist in a setlist | Stale data and two sources of truth |
| Storing transposed content | The transposition is a view, not data |
| `dangerouslySetInnerHTML` with ChordPro HTML | XSS and loss of the source of truth |
| Reading `import.meta.env` in `src/features` | Bypasses env validation |
