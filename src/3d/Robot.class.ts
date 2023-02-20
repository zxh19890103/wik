import { BoxGeometry, Mesh, MeshPhongMaterial } from 'three';

export class Robot extends Mesh {
  constructor() {
    super(new BoxGeometry(300, 400, 800), new MeshPhongMaterial({ color: 0xfa0389 }));
  }
}
