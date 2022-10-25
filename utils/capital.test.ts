import { it, expect } from 'vitest';
import { toCapital } from './capital';

it('toCapital should works well', (ctx) => {
  expect(toCapital('hello')).eq('Hello');
});
