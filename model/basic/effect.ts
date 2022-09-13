import { toCapital } from '../../utils';
import { Base } from './Base.class';

export type EffectCallReq = {
  cause: Base;
  effect: string;
  payload: any;
};

/**
 * @todo:
 * try use link data-struct to construct the effects requests, thus you can control the applications at any moment.
 */
const effectCallReqs = new Set<EffectCallReq>();

let isFlushScheduled = false;
let isEffectsApplying = false;

export const appendEffectCallReq = (req: EffectCallReq) => {
  if (isEffectsApplying) {
    console.warn('You can not call appendEffectCallReq while effects consuming...');
    return;
  }

  effectCallReqs.add(req);

  if (isFlushScheduled) return;
  isFlushScheduled = true;
  queueMicrotask(flush);
};

const flush = () => {
  isEffectsApplying = true;

  for (const req of effectCallReqs) {
    const { cause, effect, payload } = req;

    if (!__PROD__) {
      const code = effect.charCodeAt(0);
      const isCapital = code >= 65 && code <= 90;
      if (!isCapital) throw new Error('Effect name must start with capital character.');
    }

    const method = `when${effect}`;
    const snapshot = cause.getSnapshot();

    // views
    if (cause.$$views) {
      for (const view of cause.$$views) {
        view[method] && view[method](payload, snapshot);
      }
    }

    cause.emit('effect');
  }

  effectCallReqs.clear();

  isEffectsApplying = false;
  isFlushScheduled = false;
};

export function effect(...names: string[]) {
  return function (target: any, field: string, descriptor: PropertyDescriptor) {
    const func = descriptor.value;
    const effects = [toCapital(field), ...names.map(toCapital)];
    descriptor.value = function (this: Base, ...args: any[]) {
      this.snapshot();
      func.call(this, ...args);
      for (const effect of effects) {
        appendEffectCallReq({ effect, cause: this, payload: args });
      }
    };
  };
}
