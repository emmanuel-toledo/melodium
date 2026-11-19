# Approved React effects

Fixture-only approvals.

| ID      | File                  | Hook               | Reason               | Test                       |
| ------- | --------------------- | ------------------ | -------------------- | -------------------------- |
| EFF-001 | src/app/namespace.tsx | useEffect          | Fixture approved     | src/app/namespace.test.tsx |
| EFF-002 | src/app/other.tsx     | useLayoutEffect    | Fixture mismatch     | src/app/mismatch.test.tsx  |
| EFF-003 | src/app/removed.tsx   | useEffect          | Fixture stale        | src/app/removed.test.tsx   |
| EFF-004 | src/app/no-test.tsx   | useInsertionEffect | Fixture missing test | src/app/missing.test.tsx   |
