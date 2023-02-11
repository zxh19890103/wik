import { it, describe, expect } from 'vitest';
import { alias, link } from './mixin';

describe('mixin', () => {
  class A {
    say() {}
  }

  class B {}
  link(A, { say: 'hello' })(B);

  alias('hello', 'hello2')(B);

  interface B {
    hello(): void;
    hello2(): void;
  }

  it('link', () => {
    expect(A.prototype.say).eq(B.prototype.hello);
  });

  it('alias', () => {
    expect(A.prototype.say).eq(B.prototype.hello2);
  });
});
