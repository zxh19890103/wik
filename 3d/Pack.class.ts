import THREE, { Material } from 'three';
import { OnClick, OnMouseOverOut } from '../interfaces/Interactive';
import * as meta from '../model/meta';
import { BinGeometry } from './geometries';
import { IInteractive3D } from './IInteractive3D';
import { Warehouse3D } from './Warehouse.class';

export class Pack extends THREE.Mesh {
  constructor(position: meta.Position, meta: meta.Pack) {
    super(new THREE.BoxGeometry(meta.width, meta.depth, meta.height), material);
    this.position.set(position.x, position.y, position.z);
  }
}

export class InstancePack
  extends THREE.InstancedMesh
  implements OnClick, IInteractive3D, OnMouseOverOut
  implements OnClick, IInteractive3D, WithWarehouseRef
{
  private cursor = 0;
  private readonly translationMatrix = new THREE.Matrix4();
  isInteractive = true;
  activatedInstanceId: number;
  $$warehouse: Warehouse3D;

  constructor(limit: number, meta: meta.Pack) {
    super(new BinGeometry(meta.width, meta.depth, meta.height), material, limit);
  }

  /**
   * oh, no! no event payload passed in.
   */
  onHover() {
    // this.setColorAt(instanceId, color.setHex(0x00ff00));
    // this.instanceColor.needsUpdate = true;
  }

  onUnHover(state?: any): void {
    // this.setColorAt(instanceId, color.setHex(0x00ff00));
    // this.instanceColor.needsUpdate = true;
  }

  onClick(e: { instanceId: number }): void {
    const { instanceId } = e;
    console.log('pack is clicked', this, instanceId);
    // (this.material as THREE.MeshPhongMaterial).color.setHex(0xff0987);
    this.setColorAt(instanceId, color.setHex(0x00ff00));
    // this does not work, because update must be applied in next render.
    this.instanceColor.needsUpdate = true;
    // (this.material as THREE.MeshPhongMaterial).needsUpdate = true;
    // unless render()
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

const color = new THREE.Color();

const material = new THREE.MeshPhongMaterial({ color: 0x09a7f1, transparent: true, opacity: 0.8 });
