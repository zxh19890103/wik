import THREE from 'three';
import * as meta from '../model/meta';

export class Shelf extends THREE.Mesh {
  constructor(position: meta.Position) {
    super(new THREE.BoxGeometry(20, 20, 20), Shelf.material);
    this.position.set(position.x, position.y, position.z);
  }

  static get material() {
    if (!material) {
      material = new THREE.MeshBasicMaterial({ color: 0x40803f });
    }
    return material;
  }
}

let material = null;
