import { Serializable } from '../../interfaces/Serializable';
import { WithSnapshot } from '../../interfaces/WithSnapshot';
import { mixin } from './mixin';
import { WithEmitter, EmitterMix } from '../../mixins/Emitter';
import { EffectCallReq } from './effect';
import { WithParent } from '../../interfaces/WithParent';
import { IList } from './List.class';
import { WithID } from '../../interfaces/WithID';
import { EventEmitter } from 'eventemitter3';

let _id_seed = 1992;

const uniqueId = (prefix = 'model') => {
  return prefix + _id_seed++;
};

@mixin(EmitterMix)
export abstract class Base<E extends string = string>
  extends EventEmitter<E, any>
  implements Model
{
  readonly id: string = uniqueId();
  private lastSnapshot = null;

  /**
   * 考虑多种渲染
   */
  readonly $$views: View<Base<E>>[] = [];
  readonly $$parent: IList<Base<E>> = null;

  abstract fromJSON(d: any): this;
  abstract toJSON(): any;
  abstract toSnapshot(): any;

  snapshot() {
    this.lastSnapshot = this.toSnapshot();
  }

  getSnapshot() {
    return this.lastSnapshot;
  }

  remove(): void {
    this.$$parent?.remove(this);
  }
}

export interface Base<E extends string = string> extends WithEmitter<E> {
  /**
   * Call an effect responses on views.
   */
  reqEffectCall(req: EffectCallReq | string): void;
}

export interface Model extends WithSnapshot, WithID, WithParent<IList<Model>>, Serializable {
  $$views: View<Model>[];

  remove(): void;
}

export interface View<M extends Model = Model, E extends string = string> {
  model: M;
  whenInit(): void;
  whenUnInit?(): void;
  whenEffect?(effect: E): void;
}
