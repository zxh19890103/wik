import THREE, { Mesh } from 'three';
import { BoardGeometry } from './geometries/BoardGeometry.class';
import * as meta from '../model/meta';
import { InstancedMesh } from './basic';
import { OnMouseOverOut, OnSelect } from '../interfaces/Interactive';

export class Board extends Mesh {
  constructor(position: meta.Position, w: number, h: number) {
    super(new BoardGeometry(w, h), material);

    this.position.set(position.x, position.y, position.z);
  }
}

export class InstanceBoard extends InstancedMesh implements OnSelect, OnMouseOverOut {
  private cursor = 0;
  private readonly translationMatrix = new THREE.Matrix4();

  constructor(limit: number, meta: meta.Board) {
    super(new BoardGeometry(meta.width, meta.depth), material, limit);
  }

  /**
   * oh, no! no event payload passed in.
   */
  onHover() {
    this.getColorAt(this.id, color);
    const hex = color.getHex();
    this.setColorAt(this.id, color.setHex(0xf00f98));
    this.instanceColor.needsUpdate = true;
    return hex;
  }

  onUnHover(state: any): void {
    this.setColorAt(this.id, color.setHex(state));
    this.instanceColor.needsUpdate = true;
  }

  onSelect(data?: any) {
    const instanceId = this.id;

    this.getColorAt(instanceId, color);
    const hex = color.getHex();

    this.setColorAt(instanceId, color.setHex(0x00ff98));
    this.instanceColor.needsUpdate = true;

    return hex;
  }

  onUnSelect(state?: any, data?: any): void {
    this.setColorAt(this.id, color.setHex(state));
    this.instanceColor.needsUpdate = true;
  }

  putAt(slot: meta.RackBoardSlot) {
    const { x, y, z } = slot.position;

    this.translationMatrix.makeTranslation(x, y, z + 1);

    const index = this.cursor++;

    this.setMatrixAt(index, this.translationMatrix);
  }
}

const color = new THREE.Color(0xff0934);

const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
