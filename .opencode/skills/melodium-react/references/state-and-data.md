# State and data

## Ownership first

Before writing state, decide who owns it:

| Data | Owner |
| --- | --- |
| Auth session | Auth feature |
| Composition library and current composition | Compositions feature |
| Setlists and their order | Setlists feature |
| Search text and filters | The URL, when the state should be shareable |
| Local UI state (open/closed, draft text) | The closest component |
| Form values | React Hook Form |

Do not copy the same data into two owners.

## Derived state

Compute derived values during render:

```tsx
const fullName = `${firstName} ${lastName}`;
const visibleCompositions = compositions.filter((item) => item.title.includes(search));
```

Do not mirror props or other state:

```tsx
// ❌ Incorrect
const [visible, setVisible] = useState(compositions);
useEffect(() => setVisible(compositions.filter(...)), [compositions]);
```

Use `useMemo` only when the calculation is measurably expensive or a stable identity is required by an API. Do not memoize by default.

## URL state

Search, filters and other shareable view state belong in the URL:

```tsx
const [searchParams, setSearchParams] = useSearchParams();
const search = searchParams.get('q') ?? '';
const tag = searchParams.get('tag') ?? '';
```

Do not duplicate URL state in `useState`. Update the URL with `setSearchParams` from the event handler.

## Local state

- `useState` for simple local UI state.
- `useReducer` when transitions are complex or multiple values change together.
- `useRef` for mutable values that do not affect rendering.
- Lift state only when a sibling or parent needs it.
- Use `key` to reset state when the identity changes.

## Auth state

The auth feature owns the session and exposes a public hook:

```tsx
const { user, status, error } = useAuth();
```

The auth implementation should use an external store with `useSyncExternalStore` so it does not need an effect:

```ts
// Conceptual shape. The auth feature owns the real implementation.
const snapshot = useSyncExternalStore(authStore.subscribe, authStore.getSnapshot);
```

Requirements:

- `subscribe` is stable.
- `getSnapshot` returns a cached, stable object.
- The store listens to `onAuthStateChanged` and returns the unsubscribe function.
- The store exposes `status` (`loading`, `authenticated`, `anonymous`) and `error`.
- The domain type is `AuthUser`, defined by the auth feature; do not leak the Firebase `User` type into components.

## Firestore subscriptions

Prefer `onSnapshot` for the user's library and setlists. Wrap it in a feature store consumed with `useSyncExternalStore`.

A correct store has:

- A stable `subscribe(listener)` that attaches `onSnapshot`, updates the cache and returns the unsubscribe function.
- A pure `getSnapshot()` that returns the cached value, not a newly created object.
- A cached snapshot updated only when the Firestore data changes.
- An error state and a loading state.
- A query keyed by the user ID and any relevant filters.

Conceptual shape:

```ts
// src/features/compositions/api/compositions-store.ts
import {
  db,
  collection,
  onSnapshot,
  query,
  where,
} from '@/shared/lib/firebase';

import type { Composition } from '../types/composition';
import { compositionConverter } from './converters';

type Snapshot = {
  readonly status: 'loading' | 'ready' | 'error';
  readonly items: readonly Composition[];
  readonly error: Error | null;
};

export function createCompositionsStore(uid: string) {
  let snapshot: Snapshot = { status: 'loading', items: [], error: null };
  const listeners = new Set<() => void>();
  let unsubscribe: (() => void) | null = null;

  const notify = () => listeners.forEach((listener) => listener());

  const start = () => {
    if (unsubscribe) return;

    unsubscribe = onSnapshot(
      query(
        collection(db, 'users', uid, 'compositions').withConverter(compositionConverter),
        where('instrument', '==', 'guitar'),
      ),
      (result) => {
        snapshot = {
          status: 'ready',
          items: result.docs.map((doc) => doc.data()),
          error: null,
        };
        notify();
      },
      (error) => {
        snapshot = { status: 'error', items: [], error };
        notify();
      },
    );
  };

  const stop = () => {
    unsubscribe?.();
    unsubscribe = null;
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      start();
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) stop();
      };
    },
    getSnapshot() {
      return snapshot;
    },
  };
}
```

Use the store in a hook:

```ts
const store = useMemo(() => createCompositionsStore(uid), [uid]);
const { status, items, error } = useSyncExternalStore(store.subscribe, store.getSnapshot);
```

Notes:

- Do not create a new store on every render. Use `useMemo` keyed by the query identity, or create it in a parent and pass it down.
- `getSnapshot` must return the same reference until the data changes.
- If several components need the same collection, lift the hook to a common parent or share the store; avoid duplicate listeners.
- Unsubscribe when the last listener leaves.
- If the query changes, create a new store for the new key.

## One-time reads

For route-level data, prefer a React Router loader. For a component-level one-time read, use a small external store that starts the read on `subscribe`, caches the result and exposes loading/error state. Do not fall back to `useEffect`.

## Transposition and ChordPro

- `content` is the original ChordPro source.
- Parse and transpose in `src/features/compositions/lib` with pure functions.
- Compute the transposed view during render from the current `key` and `content`.
- Do not store transposed content or rendered HTML.
- Render from the parsed model as React nodes.

## Errors and loading

- Every data hook exposes an explicit status.
- Show a loading state while the subscription is starting.
- Show an empty state when the collection is legitimately empty.
- Show an error state with a retry action when the store reports an error.
- Map Firebase errors to Spanish messages in the hook or a small presenter function.
- Do not swallow errors or log them with `console.log`.

## Tests

- Mock `@/shared/lib/firebase` in unit and component tests.
- Test the store's `subscribe`/`getSnapshot` contract, including unsubscribe.
- Test loading, empty, error and ready states.
- Test auth states: loading, authenticated and anonymous.
- Never require a real Firebase project or network access.
- Firestore rules are tested separately in `tests/rules/`.
