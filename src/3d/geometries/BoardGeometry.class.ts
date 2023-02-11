import THREE, { BufferGeometry } from 'three';
import { generateRetangle } from '../utils';

export class BoardGeometry extends BufferGeometry {
  constructor(width: number, height: number) {
    super();

    const vertices = [
      ...generateRetangle(width / 2, height / 2, 0),
      ...generateRetangle(width / 2, height / 2, 0),
    ];

    const indices = [0, 1, 2, 2, 3, 0, 6, 5, 4, 4, 7, 6];
    const normals = Array(vertices.length)
      .fill(0)
      .map((_, i) => {
        if (i % 3 === 2) {
          return i < 12 ? 1 : -1;
        }
        return 0;
      });

    this.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    this.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    this.setIndex(indices);
  }
}
