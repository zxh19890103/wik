import { AbstractConstructor, Constructor } from '@/interfaces';

const hasOwn = Object.prototype.hasOwnProperty;
const defineProp = Object.defineProperty;

/**
 * 向一个对象写入一个只读属性
 */
export function writeReadonlyProp(o: object, name: string, value: any) {
  defineProp(o, name, {
    value,
    configurable: false,
    enumerable: false,
    writable: false,
  });
}

/**
 * 向一个对象写入一个属性，可写，不可删，不可枚举
 */
export function writeProp(o: object, name: string, value: any) {
  defineProp(o, name, {
    value,
    configurable: false,
    enumerable: false,
    writable: true,
  });
}

/**
 * Mixin is a abstract subclass based on a super class.
 *
 * @see https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
 */
export type Mixin<B extends object, M> = (b: Constructor<B>) => Constructor<B & M>;

function _with<B extends object, M0>(m0: Mixin<B, M0>): Constructor<B & M0>;
function _with<B extends object, M0, M1>(
  m0: Mixin<B, M0>,
  m1: Mixin<B, M1>,
): Constructor<B & M0 & M1>;
function _with<B extends object, M0, M1, M2>(
  m0: Mixin<B, M0>,
  m1: Mixin<B, M1>,
  m2: Mixin<B, M2>,
): Constructor<B & M0 & M1 & M2>;
function _with<B extends object, M0, M1, M2, M3>(
  m0: Mixin<B, M0>,
  m1: Mixin<B, M1>,
  m2: Mixin<B, M2>,
  m3: Mixin<B, M3>,
): Constructor<B & M0 & M1 & M2 & M3>;
function _with(this: any, ...mixins: Mixin<{}, {}>[]) {
  return mixins.reduce((c, _m) => {
    return _m(c);
  }, this.b);
}

const __mix_context__: MixReturns & { b: Constructor<any> } = { b: null, with: _with };
interface MixReturns {
  with: typeof _with;
}

/**
 * @mix
 * A language-suger for mix-with
 */
export function mix<B extends object>(b: Constructor<B>): MixReturns {
  __mix_context__.b = b;
  return __mix_context__;
}

/**
 * @decorator
 * Warn! just mix own methods in.
 *
 * constructor IS excluded!
 */
export function mixin(...features: Array<object | Constructor>) {
  return (to: any) => {
    for (const feature of features) {
      if (hasOwn.call(feature, 'prototype')) {
        _internal_mixin(to, feature as Constructor, true);
      } else {
        _internal_mixin(to, { name: 'FakeClass', prototype: feature } as Constructor, true);
      }
    }
  };
}

/**
 * 为 class 设置别名
 * 注意，只对方法成员有效
 * @decorator
 */
export function alias(name: string | Record<string, string>, aliasTo?: string) {
  return (target: AbstractConstructor) => {
    if (typeof name === 'object') {
      if (!__PROD__) {
        if (aliasTo !== undefined) {
          throw new Error('alias must be not provided while "name" is an object');
        }
      }

      _internal_alias(target, name);
      return;
    }

    writeReadonlyProp(target.prototype, aliasTo, target.prototype[name]);
  };
}

/**
 * 将 src 上的方法关联到目标 class 上，同时指定一个方法名称，
 * 注意，只对方法成员有效
 * @decorator
 */
export function link(src: AbstractConstructor, pairs: Record<string, string>) {
  return (dest: AbstractConstructor) => {
    const proto = src.prototype;
    const proto2 = dest.prototype;

    for (const [name, alias] of Object.entries(pairs)) {
      const value = proto[name];
      if (!value) continue;

      writeReadonlyProp(proto2, alias, value);
    }
  };
}

/**
 * set alias, just methods!
 */
function _internal_alias(to: AbstractConstructor, pairs: Record<string, string>) {
  const proto = to.prototype;

  for (const [name, alias] of Object.entries(pairs)) {
    const value = proto[name];
    if (!value) continue;

    writeReadonlyProp(proto, alias, value);
  }
}

/**
 * Just mix Own methods in DEST class's prototype.
 */
function _internal_mixin(
  destClass: AbstractConstructor,
  srcClass: Constructor,
  onlyMethods = false,
) {
  const protoDest = destClass.prototype;
  const protoSrc = srcClass.prototype;

  /**
   * constructor, method defined on CLASS are readonly and CANNOT be enumerated.
   */
  for (const key of Object.getOwnPropertyNames(protoSrc)) {
    if (key === 'constructor') continue;
    if (onlyMethods && typeof protoSrc[key] !== 'function') continue;

    if (hasOwn.call(protoDest, key)) {
      if (!__PROD__) {
        throw new Error(`member "${key}" should not be overrided in ${destClass.name}`);
      }
      return;
    }

    // but those methods defined on the super Class will be override.
    if (!__PROD__ && protoDest[key] !== undefined) {
      console.warn(
        `member "${key}" on ${destClass.name} will be overrided! Because it's not on the this prototype.`,
      );
    }

    defineProp(protoDest, key, { value: protoSrc[key] });
  }
}
