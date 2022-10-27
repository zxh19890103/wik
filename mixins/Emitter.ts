import { EventEmitter, EventNames } from 'eventemitter3';
import { SimpleObject } from '../interfaces/types';
import { HrEvent } from '../model/basic/Event.class';
import { WithParent } from '../interfaces/WithParent';
import { link } from '../model/basic';

/**
 * When you use this methods mixin, please keep in mind that the target Class you want mix must be inherited from EventEmitter
 */
@link(EventEmitter, {
  on: 'listen',
  once: 'listen$1',
  off: 'unlisten',
})
export abstract class EmitterMix implements WithParent<EmitterMix> {
  $$parent: EmitterMix;

  static event: HrEvent = null;

  noEmit = false;

  /**
   * @overrides
   */
  fire(event: string, payload: any) {
    if (this.noEmit) {
      this.noEmit = false;
      return;
    }

    if (isEmitBatchly) {
      emitObjLag = {
        target: this,
        event,
      };
      return;
    }

    const eventObj = payload instanceof HrEvent ? payload : new HrEvent(this, event, payload);
    EmitterMix.event = eventObj;

    const r = EventEmitter.prototype.emit.call(this, event, eventObj);

    if (!eventObj.stopped && this.$$parent) {
      this.$$parent.fire(event, eventObj);
    } else {
      queueMicrotask(clearGlobalEvent);
    }

    return r;
  }

  emit(...args) {
    throw new Error('use fire instead');
  }

  setEventChild(child: EmitterMix, rm = false) {
    if (!__PROD__) {
      if (!(this instanceof EventEmitter) || !(child instanceof EventEmitter)) {
        throw new Error('you can not set a non-event emitter as parent or child.');
      }
    }

    child.$$parent = rm ? null : this;

    return this;
  }
}

export const __emit__ = (context: any, event: string, payload: any) => {
  const parts = event.split(/[\s,]/g).filter(Boolean);
  if (parts.length === 0) return;
  for (const part of parts) {
    EmitterMix.prototype.fire.call(context, part, payload);
  }
};

export const __on__ = (context: any, event: string, handler: (event: HrEvent) => void) => {
  const parts = event.split(/[\s,]/g).filter(Boolean);
  if (parts.length === 0) return;

  for (const part of parts) {
    EventEmitter.prototype.on.call(context, part, handler);
  }
};

export const __off__ = (context: any, event: string, handler?: (event: HrEvent) => void) => {
  const parts = event.split(/[\s,]/g).filter(Boolean);
  if (parts.length === 0) return;

  for (const part of parts) {
    EventEmitter.prototype.off.call(context, part, handler);
  }
};

const clearGlobalEvent = () => {
  EmitterMix.event = null;
};

let isEmitBatchly = false;
let emitObjLag: { target: any; event: string } = null;

export const __batched_fires__ = <R = any>(fn: () => R | Promise<R>, event?: string) => {
  isEmitBatchly = true;
  const p = fn();
  if (p instanceof Promise) {
    return p.then(() => {
      isEmitBatchly = false;
      emitObjLag?.target.fire(event || emitObjLag.event);
    });
  } else {
    isEmitBatchly = false;
    emitObjLag?.target.fire(event || emitObjLag.event);
    return p;
  }
};

export interface WithEmitter<E extends string> {
  /**
   * set it True, the follow emit will be ignore and then set it False.
   */
  noEmit: boolean;

  fire<T extends EventNames<E>>(event: T, payload?: SimpleObject): boolean;
  listen<T extends EventNames<E>>(event: T, fn: (event: HrEvent) => void, context?: any): this;
  unlisten<T extends EventNames<E>>(event: T, fn?: (event: HrEvent) => void): this;
  listen$1<T extends EventNames<E>>(event: T, fn: (event: HrEvent) => void, context?: any): this;

  /**
   * Create parent-child relationships of two evented objects manually.
   * Because this method not mounted on evented object.
   */
  setEventChild(child: WithEmitter<string>, rm?: boolean): this;
}
