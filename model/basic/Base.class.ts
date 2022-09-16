import { Serializable } from '../../interfaces/Serializable';
import { WithSnapshot } from '../../interfaces/WithSnapshot';
import { mixin } from './mixin';
import { WithEmitter, WithEmitterMix } from '../../mixins/Emitter';
import { EffectCallReq } from './effect';

let _id_seed = 1992;

const uniqueId = (prefix = 'model') => {
  return prefix + _id_seed++;
};

export interface WithID {
  id: string;
}

@mixin(WithEmitterMix)
export abstract class Base<E extends string = string>
  extends EventEmitter3<E, any>
  implements WithSnapshot, WithID, Serializable
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
}

export interface Base<E extends string = string> extends WithEmitter<E> {
  /**
   * Call an effect responses on views.
   */
  reqEffectCall(req: EffectCallReq | string): void;
}

export interface View<M extends Base = Base, E extends string = string> {
  model: M;
  whenInit(): void;
  whenEffect?(effect: E): void;
}
