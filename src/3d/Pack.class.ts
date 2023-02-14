import THREE, { BoxGeometry } from 'three';
import { OnClick, OnMouseOverOut, OnSelect } from '@/interfaces/Interactive';
import { WithWarehouseRef } from '@/model/IWarehouseObjectList';
import * as meta from '@/model/meta';
import { InstancedMesh } from './basic';
import { BinGeometry } from './geometries';
import { Warehouse3D } from './Warehouse.class';

export class Pack extends THREE.Mesh {
  constructor(position: meta.Position, meta: meta.Pack) {
    super(
      new THREE.BoxGeometry(meta.width, meta.depth, meta.height),
      new THREE.MeshPhongMaterial({
        color: 0xffffff,
        transparent: false,
        opacity: 0.76,
      }),
    );
    this.position.set(position.x, position.y, position.z);
  }
}

export class InstancePack
  extends InstancedMesh
  implements OnClick, OnSelect, OnMouseOverOut, WithWarehouseRef
{
  $$warehouse: Warehouse3D;

  constructor(limit: number, meta: meta.Pack) {
    super(
      new BoxGeometry(meta.width, meta.depth, meta.height),
      new THREE.MeshPhongMaterial({
        color: 0xf09812,
        transparent: true,
        opacity: 0.89,
      }),
      limit,
    );
  }

  onSelect() {
    const hex = this.getColor();
    this.setColor(0x00ff98);

    return hex;
  }

  onUnSelect(state?: any, data?: any): void {
    this.setColor(state);
  }

  /**
   * oh, no! no event payload passed in.
   */
  onHover() {
    const hex = this.getColor();
    this.setColor(0xf00f98);
    return hex;
  }

  onUnHover(state: any): void {
    this.setColor(state);
  }

  onClick(e: { instanceId: number }): void {
    console.log('click pack.', this.id);
    // this.deleteInstance(this.id);
    // this.updateInstances();
  }
}
