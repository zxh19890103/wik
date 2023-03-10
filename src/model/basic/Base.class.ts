import { Serializable } from '@/interfaces';
import { mixin } from './mixin';
import { WithParent } from '@/interfaces';
import { WithID } from '@/interfaces';
import { SnapshotMix, WithSnapshot } from '@/model/basic/Snapshot';
import { EffectCallReq } from './effect';
import { Core } from './Core.class';
import { IList } from './IList';

export interface Model extends WithID, WithParent<IList<Model>>, Serializable {
  $$views: View<Model>[];
  remove(): void;
}

export interface View<M extends Model = Model, E extends string = string> {
  /**
   * if this view is a threejs object3d
   */
  id?: number;
  /**
   * if this view is a reactive leaflet layer
   */
  layerId?: string;
  /**
   * if this view is a native leaflet layer
   */
  leafletId?: string;
  model: M;
  whenInit(): void;
  whenUnInit?(): void;
  whenEffect?(effect: E): void;
}

@mixin(SnapshotMix)
export abstract class Base<E extends string = string> extends Core<E> implements Model {
  readonly id: string = `model${idseed++}`;
  readonly $$views: View<Base<E>>[] = [];
  readonly $$parent: IList<Base<E>> = null;

  abstract fromJSON(d: any): this;
  abstract toJSON(): any;
  abstract toSnapshot(): any;

  remove(): void {
    this.$$parent?.remove(this);
  }
}

export interface Base<E extends string = string> extends WithSnapshot<any> {
  /**
   * Call an effect responses on views.
   */
  reqEffectCall(req: EffectCallReq | string): void;
}

let idseed = 1992;
