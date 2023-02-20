import * as THREE from 'three';
import { __batched_fires__ } from '../model/basic/Emitter';
import { IWarehouse } from '@/model';
import { CoreList, util$$ } from '@/model';
import { IWarehouseObjectList } from '@/model/IWarehouseObjectList';
import { Constructor } from '@/interfaces';

export class Object3DList<M extends THREE.Object3D>
  extends CoreList<M>
  implements IWarehouseObjectList
{
  readonly $$parent: IWarehouse;
  readonly itemKey: string = 'id';
  readonly scene: THREE.Scene;
  readonly mounted: boolean = false;

  mount(root: THREE.Scene): void {
    this.assign('scene', root);
    this.assign('mounted', true);

    // init add to ui
    for (const item of this.items) {
      root.add(item);
      util$$.writeProp(item, '$$warehouse', this.$$parent);
    }
  }

  unmount(): void {
    for (const item of this.items) {
      this.scene.remove(item);
      util$$.writeProp(item, '$$warehouse', null);
    }

    this.assign('scene', null);
    this.assign('mounted', false);
  }

  protected override _add(item: M): void {
    util$$.writeProp(item, '$$warehouse', this.$$parent);
    this.scene?.add(item);
    super._add(item);
  }

  protected override _remove(item: M): void {
    this.scene?.remove(item);
    super._remove(item);
  }

  protected override _clear(): void {
    for (const item of this.items) {
      this.scene?.remove(item);
    }

    super._clear();
  }

  create(...args: ConstructorParameters<Constructor<M>>): M {
    // const m = new ()
    throw new Error('ha');
  }
}
