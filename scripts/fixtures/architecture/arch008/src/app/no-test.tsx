import { useInsertionEffect } from 'react';

export function NoTest() {
  useInsertionEffect(() => {}); // effect: EFF-004

  return null;
}
