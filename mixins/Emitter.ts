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

  emit(event, payload) {
    if (this.noEmit) {
      this.noEmit = false;
      return;
    }
    const eventObj = payload instanceof HrEvent ? payload : new HrEvent(this, event, payload);
    EmitterMix.event = eventObj;
    // skip this.emit access super.
    const r = this.__super__.emit.call(this, event, eventObj);
    if (!eventObj.stopped && this.$$parent) {
      this.$$parent.emit(event, eventObj);
    } else {
      Promise.resolve().then(() => {
        EmitterMix.event = null;
      });
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
