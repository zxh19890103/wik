import * as THREE from 'three';
import { __batched_fires__ } from '../mixins/Emitter';
import { IWarehouse } from '../model';
import { CoreList, writeReadonlyProp } from '../model/basic';
import { IWarehouseObjectList } from '../model/IWarehouseObjectList';

export class Object3DList<M extends THREE.Object3D>
  extends CoreList<M>
  implements IWarehouseObjectList
{
  readonly $$parent: IWarehouse;
  readonly itemKey: string = 'id';
  readonly scene: THREE.Scene;
  readonly mounted: boolean = false;

  mount(root: THREE.Scene): void {
    writeReadonlyProp(this, 'scene', root);
    writeReadonlyProp(this, 'mounted', true);

    // init add to ui
    for (const item of this.items) {
      root.add(item);
    }
  }

  protected override _add(item: M): void {
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

  create(...args: any[]): M {
    throw new Error('Method not implemented.');
  }
}
