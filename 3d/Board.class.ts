import THREE, { InstancedMesh, Mesh, MeshPhongMaterial } from 'three';
import { BoardGeometry } from './geometries/BoardGeometry.class';
import * as meta from '../model/meta';
import { Shelf } from './Shelf.class';
import { OnClick } from '../interfaces/Interactive';
import { IInteractive3D } from './IInteractive3D';

export class Board extends Mesh {
  constructor(position: meta.Position, w: number, h: number) {
    super(new BoardGeometry(w, h), material);

    this.position.set(position.x, position.y, position.z);
  }
}

export class InstanceBoard extends InstancedMesh implements OnClick, IInteractive3D {
  private cursor = 0;
  private readonly translationMatrix = new THREE.Matrix4();

  isInteractive = false;
  activatedInstanceId: number;

  /**
   * which shelf it is on.
   */
  shelf: Shelf = null;
  /**
   * on which layer of the shelf.
   */
  layerIndex = 0;

  constructor(limit: number, meta: meta.Board) {
    super(new BoardGeometry(meta.width, meta.depth), material, limit);
  }

  onClick(e: { instanceId: number }): void {
    // const { instanceId } = e;
    // this.setColorAt(instanceId, new THREE.Color(0xff0000));
    // this.instanceColor.needsUpdate = true;

    console.log('board is clicked');
  }

  putAt(rack: Shelf, slot: meta.RackBoardSlot) {
    const { x, y, z } = slot.position;

    this.translationMatrix.makeTranslation(x, y, z + 1);

    this.setMatrixAt(this.cursor++, this.translationMatrix);

    this.shelf = rack;
    this.layerIndex = slot.layer;
  }
}

const material = new THREE.MeshPhongMaterial({ color: 0xf06034, transparent: false, opacity: 0.8 });
