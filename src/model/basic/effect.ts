import { toCapital } from '../../utils';
import { Base } from './Base.class';
import { writeReadonlyProp } from './mixin';

export type EffectCallReq = {
  /**
   * the subject of effect
   */
  cause?: Base;
  /**
   * cuz by, a method name on cause.
   */
  by: string;
  /**
   * effect name
   */
  effect: string;
  /**
   * arguments of by
   */
  payload: any;
};

/**
 * @todo:
 * try use link data-struct to construct the effects requests, thus you can control the applications at any moment.
 */
const effectCallReqs = new Map<Base, EffectCallReq[]>();

let isFlushScheduled = false;
let isEffectsApplying = false;

function appendEffectCallReq(this: Base, _req: EffectCallReq | string) {
  if (isEffectsApplying) {
    // eslint-disable-next-line quotes
    console.warn("You can't call appendEffectCallReq while effects applying...");
    return;
  }

  let req: EffectCallReq = null;

  if (typeof _req === 'string') {
    req = { effect: _req, payload: null, by: null, cause: null };
  } else {
    req = _req;
  }

  if (!req.cause && this instanceof Base) {
    req.cause = this;
  }

  const effects = effectCallReqs.get(req.cause);
  if (effects) {
    effects.push(req);
  } else {
    effectCallReqs.set(req.cause, [req]);
  }

  if (isFlushScheduled) return;
  isFlushScheduled = true;
  queueMicrotask(flush);
}

writeReadonlyProp(Base.prototype, 'reqEffectCall', appendEffectCallReq);

const flush = () => {
  isEffectsApplying = true;

  for (const [cause, reqs] of effectCallReqs) {
    if (!cause.$$views || cause.$$views.length === 0) continue;

    const snapshot = cause.getSnapshot();

    let req: EffectCallReq = null;
    while ((req = reqs.shift())) {
      const { effect, payload, by } = req;
      for (const view of cause.$$views) {
        view[effect] && view[effect](payload, snapshot, by);
      }
    }

    cause.fire('effect');
  }

  effectCallReqs.clear();

  isEffectsApplying = false;
  isFlushScheduled = false;
};

type EffectNameDescriptor<N extends string> =
  | N
  | {
      /**
       * is the method name & signatures the same to that on the views? default is false.
       */
      self?: boolean;
      /**
       * the name of effect, whose whenEffect will be called on views.
       */
      name?: N;
      /**
       * add prefix 'when', default is true
       */
      prefix?: boolean;
    };

export function effect<N extends string = string>(...names: EffectNameDescriptor<N>[]) {
  return function (target: any, field: string, descriptor: PropertyDescriptor) {
    const func = descriptor.value;

    const effects = names
      .map((x) => {
        if (!x) return null;
        if (typeof x === 'string') {
          return `when${toCapital(x)}`;
        }
        const name = toCapital(x.self ? field : x.name);
        const prefix = x.prefix === undefined ? true : x.prefix;
        return prefix ? `when${name}` : name;
      })
      .filter(Boolean);

    descriptor.value = function (this: Base, ...args: any[]) {
      this.snapshot();
      func.call(this, ...args);
      for (const effect of effects) {
        appendEffectCallReq.call(null, { effect, by: field, cause: this, payload: args });
      }
    };
  };
}
