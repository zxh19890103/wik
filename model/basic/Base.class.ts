import { Serializable } from '../../interfaces/Serializable';
import { WithSnapshot } from '../../interfaces/WithSnapshot';
import { appendEffectCallReq } from './effect';
import { mixin } from './mixin';
import { WithEmitter, WithEmitterMix } from '../../mixins/Emitter';

let _id_seed = 1992;

const uniqueId = (prefix = 'model') => {
  return prefix + _id_seed++;
};

@mixin(WithEmitterMix)
export abstract class Base<E extends string = string>
  extends EventEmitter3<E, any>
  implements WithSnapshot, Serializable
{
  id: string = uniqueId();
  private _snapshot = null;

  /**
   * 考虑多种渲染
   */
  $$views: View<Base>[] = [];
  $$parent: Base = null;

  abstract fromJSON(d: any): this;
  abstract toJSON(): any;

  toSnapshot() {
    return null;
  }

  snapshot() {
    this._snapshot = this.toSnapshot();
  }

  getSnapshot() {
    return this._snapshot;
  }

  reqEffectCall(effect: E, payload: any = null) {
    this.snapshot();
    appendEffectCallReq({ cause: this, effect, payload });
  }
}

export interface Base<E extends string = string> extends WithEmitter<E> {}

export interface View<M extends Base = Base, E extends string = string> {
  model: M;
  whenInit(): void;
  whenTrash(): void;
  whenEffect?(effect: E): void;
}

export type ViewMake<M, V> = (m: M) => V;

/**
 * This is the inferace for unifing THREE.js and Leaflet and so on.
 */
export interface ViewContainer<M extends Base, V extends View<M>> {
  $$make: ViewMake<M, V>;
  add(...items: V[]): void;
  remove(...items: V[]): void;
}

export function makeModelView<M extends Base, V extends View<M>>(v: V, m: M) {
  v.model = m;
  m.$$views.push(v);
  v.whenInit();
}
