import { Serializable } from '../../interfaces/Serializable';
import { mixin } from './mixin';
import { WithEmitter, EmitterMix } from '../../mixins/Emitter';
import { WithParent } from '../../interfaces/WithParent';
import { IList } from './List.class';
import { WithID } from '../../interfaces/WithID';
import { EventEmitter } from 'eventemitter3';
import { SnapshotMix, WithSnapshot } from '../../mixins/Snapshot';
import { EffectCallReq } from './effect';

let _id_seed = 1992;

const uniqueId = (prefix = 'model') => {
  return prefix + _id_seed++;
};

@mixin(EmitterMix, SnapshotMix)
export abstract class Base<E extends string = string>
  extends EventEmitter<E, any>
  implements Model
{
  readonly id: string = uniqueId();

  /**
   * 考虑多种渲染
   */
  readonly $$views: View<Base<E>>[] = [];
  readonly $$parent: IList<Base<E>> = null;

  abstract fromJSON(d: any): this;
  abstract toJSON(): any;
  abstract toSnapshot(): any;

  remove(): void {
    this.$$parent?.remove(this);
  }
}

export interface Base<E extends string = string> extends WithEmitter<E>, WithSnapshot<any> {
  /**
   * Call an effect responses on views.
   */
  reqEffectCall(req: EffectCallReq | string): void;
}

export interface Model extends WithID, WithParent<IList<Model>>, Serializable {
  $$views: View<Model>[];
  remove(): void;
}

export interface View<M extends Model = Model, E extends string = string> {
  model: M;
  whenInit(): void;
  whenUnInit?(): void;
  whenEffect?(effect: E): void;
}
