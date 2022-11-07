import THREE from 'three';
import { OnClick } from '../interfaces/Interactive';
import * as meta from '../model/meta';
import { BinGeometry } from './geometries';
import { IInteractive3D } from './IInteractive3D';

export class Pack extends THREE.Mesh {
  constructor(position: meta.Position, meta: meta.Pack) {
    super(new THREE.BoxGeometry(meta.width, meta.depth, meta.height), material);
    this.position.set(position.x, position.y, position.z);
  }
}

export class InstancePack extends THREE.InstancedMesh implements OnClick, IInteractive3D {
  private cursor = 0;
  private readonly translationMatrix = new THREE.Matrix4();
  isInteractive = true;

  constructor(limit: number, meta: meta.Pack) {
    super(new BinGeometry(meta.width, meta.depth, meta.height), material, limit);
  }

  onClick(e: { instanceId: number }): void {
    const { instanceId } = e;
    this.setColorAt(instanceId, new THREE.Color(0xff0000));
    this.instanceColor.needsUpdate = true;
  }

  putAt(slot: meta.RackPackSlot) {
    const { x, y, z } = slot.position;

    this.translationMatrix.makeTranslation(x, y, z + 2);

    this.setMatrixAt(this.cursor++, this.translationMatrix);
  }
}

const material = new THREE.MeshPhongMaterial({ color: 0x09a7f1 });
