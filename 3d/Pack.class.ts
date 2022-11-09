import THREE, { Color } from 'three';
import { OnClick, OnMouseOverOut, OnSelect } from '../interfaces/Interactive';
import { WithWarehouseRef } from '../model/IWarehouseObjectList';
import * as meta from '../model/meta';
import { BinGeometry } from './geometries';
import { Interactive3D } from './IInteractive3D';
import { Warehouse3D } from './Warehouse.class';

export class Pack extends THREE.Mesh {
  constructor(position: meta.Position, meta: meta.Pack) {
    super(new THREE.BoxGeometry(meta.width, meta.depth, meta.height), material);
    this.position.set(position.x, position.y, position.z);
  }
}

export class InstancePack
  extends THREE.InstancedMesh
  implements OnClick, OnSelect, OnMouseOverOut, WithWarehouseRef
{
  private cursor = 0;
  private readonly translationMatrix = new THREE.Matrix4();

  $$warehouse: Warehouse3D;

  constructor(limit: number, meta: meta.Pack) {
    super(new BinGeometry(meta.width, meta.depth, meta.height), material, limit);
    this.isInstancedMesh;
  }

  onSelect(data?: any) {
    this.getColorAt(data.instanceId, color);
    const hex = color.getHex();

    this.setColorAt(data.instanceId, color.setHex(0x00ff98));
    this.instanceColor.needsUpdate = true;

    return hex;
  }

  onUnSelect(state?: any, data?: any): void {
    this.setColorAt(data.instanceId, color.setHex(state));
    this.instanceColor.needsUpdate = true;
  }

  /**
   * oh, no! no event payload passed in.
   */
  onHover(data: { instanceId: number }) {
    this.getColorAt(data.instanceId, color);
    const hex = color.getHex();
    this.setColorAt(data.instanceId, color.setHex(0xf00f98));
    this.instanceColor.needsUpdate = true;
    return hex;
  }

  onUnHover(state: any, data: { instanceId: number }): void {
    this.setColorAt(data.instanceId, color.setHex(state));
    this.instanceColor.needsUpdate = true;
  }

  onClick(e: { instanceId: number }): void {
    // const { instanceId } = e;
    // console.log('pack is clicked', this, instanceId);
    // (this.material as THREE.MeshPhongMaterial).color.setHex(0xff0987);
    // this.setColorAt(instanceId, color.setHex(0x00ff00));
    // this does not work, because update must be applied in next render.
    // this.instanceColor.needsUpdate = true;
    // (this.material as THREE.MeshPhongMaterial).needsUpdate = true;
    // unless render()
    // let id = 0;
    // const loop = () => {
    //   if (id === this.count) return;
    //   setTimeout(loop, 5);
    //   this.setColorAt(id, color.setHex(Math.random() * 0xffffff));
    //   id += 1;
    //   this.instanceColor.needsUpdate = true;
    // };
    // loop();
  }

  putAt(slot: meta.RackPackSlot) {
    const { x, y, z } = slot.position;

    this.translationMatrix.makeTranslation(x, y, z + 2);

    const id = this.cursor++;
    /**
     * index color must be set to update.
     */
    this.setColorAt(id, color);
    this.setMatrixAt(id, this.translationMatrix);
  }
}

const color = new THREE.Color(0xffffff);

const material = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  transparent: false,
  opacity: 0.76,
});
