import { Mesh, MeshPhongMaterial } from 'three';
import { BoardGeometry } from './geometries/BoardGeometry.class';

export class Ground extends Mesh {
  constructor(w: number, h: number, color?: number) {
    super(
      new BoardGeometry(w, h),
      new MeshPhongMaterial({
        color: color || 0x348700,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    );
    this.position.setComponent(2, -1);
  }
}
