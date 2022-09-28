import { Serializable } from '../../interfaces/Serializable';
import { WithSnapshot } from '../../interfaces/WithSnapshot';
import { mixin } from './mixin';
import { WithEmitter, EmitterMix } from '../../mixins/Emitter';
import { EffectCallReq } from './effect';
import { WithParent } from '../../interfaces/WithParent';
import { IList } from './List.class';
import { WithID } from '../../interfaces/WithID';

let _id_seed = 1992;

const uniqueId = (prefix = 'model') => {
  return prefix + _id_seed++;
};

@mixin(EmitterMix)
export abstract class Base<E extends string = string>
  extends EventEmitter3<E, any>
  implements WithSnapshot, WithID, WithParent<IList<Base>>, Serializable
{
  id: string = uniqueId();
  private lastSnapshot = null;

  /**
   * 考虑多种渲染
   */
  $$views: View<Base>[] = [];
  $$parent: IList<Base> = null;

  abstract fromJSON(d: any): this;
  abstract toJSON(): any;
  abstract toSnapshot(): any;

  snapshot() {
    this.lastSnapshot = this.toSnapshot();
  }

  getSnapshot() {
    return this.lastSnapshot;
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
