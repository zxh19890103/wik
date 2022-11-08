import { Mesh, MeshBasicMaterial, MeshPhongMaterial } from 'three';
import { BoardGeometry } from './geometries/BoardGeometry.class';

export class Ground extends Mesh {
  constructor(w: number, h: number) {
    super(new BoardGeometry(w, h), new MeshPhongMaterial({ color: 0x348700 }));
    this.position.setComponent(2, -1);
  }
}
