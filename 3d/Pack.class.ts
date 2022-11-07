import THREE from 'three';
import { OnClick } from '../interfaces/Interactive';
import { nextTick } from '../model/basic/nextTick';
import { WithWarehouseRef } from '../model/IWarehouseObjectList';
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
  implements OnClick, IInteractive3D, WithWarehouseRef
{
  private cursor = 0;
  private readonly translationMatrix = new THREE.Matrix4();
  isInteractive = true;
  $$warehouse: Warehouse3D;

  constructor(limit: number, meta: meta.Pack) {
    super(new BinGeometry(meta.width, meta.depth, meta.height), material, limit);
  }

  onClick(e: { instanceId: number }): void {
    const { instanceId } = e;
    console.log('pack is clicked', instanceId);

    nextTick(() => {
      this.setColorAt(instanceId, new THREE.Color(0xff0000));
      // this does not work, because update must be applied in next render.
      this.instanceColor.needsUpdate = true;
      // unless render()
    });
  }

  putAt(slot: meta.RackPackSlot) {
    const { x, y, z } = slot.position;

    this.translationMatrix.makeTranslation(x, y, z + 2);

    this.setMatrixAt(this.cursor++, this.translationMatrix);
  }
}

const material = new THREE.MeshPhongMaterial({ color: 0x09a7f1 });
