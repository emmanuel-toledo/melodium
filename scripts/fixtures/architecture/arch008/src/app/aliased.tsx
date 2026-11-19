import { useEffect as useThing } from 'react';

export function Aliased() {
  useThing(() => {}); // effect: EFF-404

  return null;
}
