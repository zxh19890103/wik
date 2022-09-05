import { EventEmitter, EventNames } from 'eventemitter3';
import { AnyObject } from '../interfaces/types';
import { writeReadonlyProp } from '../model/basic/mixin';
import { HrEvent } from '../model/basic/Event.class';

writeReadonlyProp(window, 'EventEmitter3', EventEmitter);

/**
 * Create parent-child relationships of two evented objects manually.
 * Because this method not mounted on evented object.
 *
 */
export function setEventChild(this: any, child: any, rm = false) {
  if (!__PROD__) {
    if (!(this instanceof EventEmitter3) || !(child instanceof EventEmitter3)) {
      throw new Error('you can not set a non-event emitter as parent or child.');
    }
  }

  child.$$parent = rm ? null : this;

  return this;
}

/**
 * When you use this methods mixin, please keep in mind that the target Class you want mix must be inherited from EventEmitter
 */
export abstract class WithEmitterMix {
  __super__: any;
  /**
   * This field has the name $$parent declared, which keep consistent with /model/basic/Base.class
   */
  $$parent: WithEmitterMix;

  static event: HrEvent = null;

  emit(event, payload) {
    const eventObj = payload instanceof HrEvent ? payload : new HrEvent(this, event, payload);
    WithEmitterMix.event = eventObj;
    // skip this.emit access super.
    const r = this.__super__.emit.call(this, event, eventObj);
    if (!eventObj.stopped && this.$$parent) {
      this.$$parent.emit(event, eventObj);
    } else {
      Promise.resolve().then(() => {
        WithEmitterMix.event = null;
      });
    }
    return r;
  }
}

writeReadonlyProp(WithEmitterMix.prototype, 'setEventChild', setEventChild);

export interface WithEmitter<E extends string> {
  emit<T extends EventNames<E>>(event: T, payload?: AnyObject): boolean;
  on<T extends EventNames<E>>(event: T, fn: (event: HrEvent) => void): this;
  off<T extends EventNames<E>>(event: T, fn?: (event: HrEvent) => void): this;
  once<T extends EventNames<E>>(event: T, fn: (event: HrEvent) => void): this;
  setEventChild(child: WithEmitter<string>, rm?: boolean): this;
}
