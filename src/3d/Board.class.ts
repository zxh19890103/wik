import THREE, { Mesh } from 'three';
import { BoardGeometry } from './geometries/BoardGeometry.class';
import * as meta from '@/model/meta';
import { InstancedMesh } from './basic';

export class Board extends Mesh {
  constructor(position: meta.Position, w: number, h: number) {
    super(
      new BoardGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }),
    );

    this.position.set(position.x, position.y, position.z);
  }
}

export class InstanceBoard extends InstancedMesh {
  constructor(limit: number, meta: meta.Board) {
    super(
      new BoardGeometry(meta.width, meta.depth),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 }),
      limit,
    );
  }
}
