import { Mesh, MeshPhongMaterial } from 'three';
import { BoardGeometry } from './geometries/BoardGeometry.class';

export class Ground extends Mesh {
  constructor(params: { w: number; h: number; color?: number; unlimit?: boolean }) {
    super(
      new BoardGeometry(params.w, params.h),
      new MeshPhongMaterial({
        color: params.color ?? 0x348700,
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
      }),
    );
    this.position.setComponent(2, -1);
  }
}
