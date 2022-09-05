import { Base } from './Base.class';

export type EffectCallReq = {
  cause: Base;
  effect: string;
  payload: any;
};

const effectCallReqs = new Set<EffectCallReq>();

let isFlushScheduled = false;
let isCallingEffects = false;

export const appendEffectCallReq = (req: EffectCallReq) => {
  if (isCallingEffects) {
    console.warn('You can not call appendEffectCallReq while effects consuming...');
    return;
  }

  effectCallReqs.add(req);

  if (isFlushScheduled) return;
  isFlushScheduled = true;
  queueMicrotask(flush);
};

const flush = () => {
  isCallingEffects = true;

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

  isCallingEffects = false;
  isFlushScheduled = false;
};
