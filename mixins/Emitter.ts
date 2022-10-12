import { EventEmitter, EventNames } from 'eventemitter3';
import { AnyObject } from '../interfaces/types';
import { writeReadonlyProp } from '../model/basic/mixin';
import { HrEvent } from '../model/basic/Event.class';
import { WithParent } from '../interfaces/WithParent';

writeReadonlyProp(window, 'EventEmitter3', EventEmitter);

/**
 * When you use this methods mixin, please keep in mind that the target Class you want mix must be inherited from EventEmitter
 */
export abstract class EmitterMix implements WithParent<EmitterMix> {
  __super__: any;
  $$parent: EmitterMix;

  static event: HrEvent = null;

  noEmit = false;

  emit(event: string, payload: any) {
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

    const r = this.__super__.emit.call(this, event, eventObj);

    if (!eventObj.stopped && this.$$parent) {
      this.$$parent.emit(event, eventObj);
    } else {
      queueMicrotask(clearGlobalEvent);
    }

    return r;
  }

  setEventChild(child: EmitterMix, rm = false) {
    if (!__PROD__) {
      if (!(this instanceof EventEmitter3) || !(child instanceof EventEmitter3)) {
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
    EmitterMix.prototype.emit.call(context, part, payload);
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

export const __batched_emits__ = <R = any>(fn: () => R | Promise<R>, event?: string) => {
  isEmitBatchly = true;
  const p = fn();
  if (p instanceof Promise) {
    return p.then(() => {
      isEmitBatchly = false;
      emitObjLag?.target.emit(event || emitObjLag.event);
    });
  } else {
    isEmitBatchly = false;
    emitObjLag?.target.emit(event || emitObjLag.event);
    return p;
  }
};

export interface WithEmitter<E extends string> {
  /**
   * set it True, the follow emit will be ignore and then set it False.
   */
  noEmit: boolean;

  emit<T extends EventNames<E>>(event: T, payload?: AnyObject): boolean;
  on<T extends EventNames<E>>(event: T, fn: (event: HrEvent) => void, context?: any): this;
  off<T extends EventNames<E>>(event: T, fn?: (event: HrEvent) => void): this;
  once<T extends EventNames<E>>(event: T, fn: (event: HrEvent) => void, context?: any): this;

  /**
   * Create parent-child relationships of two evented objects manually.
   * Because this method not mounted on evented object.
   *
   */
  setEventChild(child: WithEmitter<string>, rm?: boolean): this;
}
