import { Constructor } from '../../interfaces/Constructor';

const hasOwn = Object.prototype.hasOwnProperty;
const defineProp = Object.defineProperty;

/**
 *  定义一个属性到 target 的原型，
 *  定义的属性为不可删除，不可编辑，不可枚举
 */
export function defineReadonly(target: Constructor, name: string, value: any) {
  defineProp(target.prototype, name, {
    value,
    configurable: false,
    enumerable: false,
    writable: false,
  });
}

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

export function invokeMethod(o: object, name: string, ...args: any[]) {
  if (o[name] && typeof o[name] === 'function') {
    return o[name](...args);
  }
  return null;
}

/**
 * Mixin is a abstract subclass based on a super class.
 *
 * @see https://justinfagnani.com/2015/12/21/real-mixins-with-javascript-classes/
 */
export type Mixin<B, M> = (b: Constructor<B>) => Constructor<B & M>;

function _with<B, M0>(m0: Mixin<B, M0>): Constructor<B & M0>;
function _with<B, M0, M1>(m0: Mixin<B, M0>, m1: Mixin<B, M1>): Constructor<B & M0 & M1>;
function _with<B, M0, M1, M2>(
  m0: Mixin<B, M0>,
  m1: Mixin<B, M1>,
  m2: Mixin<B, M2>,
): Constructor<B & M0 & M1 & M2>;
function _with<B, M0, M1, M2, M3>(
  m0: Mixin<B, M0>,
  m1: Mixin<B, M1>,
  m2: Mixin<B, M2>,
  m3: Mixin<B, M3>,
): Constructor<B & M0 & M1 & M2 & M3>;
function _with(this: any, ...mixins: Mixin<{}, {}>[]) {
  return mixins.reduce((c, mixin) => {
    return mixin(c);
  }, this.b);
}

const singleton: { with: typeof _with } = { with: _with };

/**
 * @mix
 * A language-suger for mix-with
 */
export function mix<B>(b: Constructor<B>) {
  (singleton as any).b = b;
  return singleton;
}

/**
 * Just mix Own methods in DEST class's prototype.
 */
export function setMixin(destClass: Constructor, srcClass: Constructor, onlyMethods = false) {
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
    if (protoDest[key] !== undefined) {
      console.warn(
        `member "${key}" on ${destClass.name} will be overrided! Because it's not on the this prototype.`,
      );
    }

    defineProp(protoDest, key, { value: protoSrc[key] });
  }
}

/**
 * @decorator
 * Warn! just mix own methods in.
 *
 * constructor IS excluded!
 */
export function mixin(...features: Array<object | Constructor>) {
  // return (to: Constructor<any>) => { // Type check is not right for abstract
  return (to: any) => {
    defineReadonly(to, '__super__', Object.getPrototypeOf(to.prototype));

    for (const feature of features) {
      if (hasOwn.call(feature, 'prototype')) {
        setMixin(to, feature as Constructor, true);
      } else {
        setMixin(to, { name: 'FakeClass', prototype: feature } as Constructor, true);
      }
    }
  };
}

/**
 * set alias, just methods!
 */
export function setAlias(to: Constructor, pairs: Record<string, string>) {
  const proto = to.prototype;
  for (const key of Object.keys(pairs)) {
    defineReadonly(to, pairs[key], proto[key]);
  }
}

/**
 * decorator
 */
export function alias(name: string | Record<string, string>, aliasTo?: string) {
  return (target: Constructor) => {
    if (typeof name === 'object') {
      if (!__PROD__) {
        if (aliasTo !== undefined) {
          throw new Error('alias must be not provided while "name" is an object');
        }
      }

      setAlias(target, name);
      return;
    }

    defineReadonly(target, aliasTo, target.prototype[name]);
  };
}
