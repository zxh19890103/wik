import THREE, { BufferGeometry, LineBasicMaterial } from 'three';
import { OnClick } from '@/interfaces/Interactive';
import { InstancedMesh } from './basic';
import { InstanceBoard } from './Board.class';
import { InstancePack } from './Pack.class';
import { generateRetangle } from './utils';
import * as meta from '@/model/meta';

export class Shelf extends THREE.LineSegments implements OnClick {
  packs: InstancePack[] = [];
  boards: InstanceBoard[] = [];

  constructor(position: meta.Position, private meta: meta.Rack) {
    const geometry = new BufferGeometry();
    const { vertices, indices } = generateVertices(meta);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    super(geometry, Shelf.material);
    this.position.set(position.x, position.y, position.z);
  }

  onClick(e?: unknown): void {
    console.log('clicked');
  }

  /**
   * returns every slots for given size of pack.
   */
  getPackSlots(pack: meta.Pack): meta.RackPackSlot[] {
    const { distanceOffGround, heightPerLayer, height, width } = this.meta;

    const { x, y, z } = this.position;
    const slots: meta.RackPackSlot[] = [];

    const slotWidth = pack.width + 10;
    const nLimit = Math.floor(width / slotWidth);
    const lLimit = Math.floor(height / heightPerLayer);

    for (let l = 0; l < lLimit; l += 1) {
      for (let n = 0; n < nLimit; n += 1) {
        slots.push({
          layer: l,
          n,
          position: {
            x: -width / 2 + n * slotWidth + slotWidth / 2 + x,
            y: y,
            z: pack.height / 2 + z + distanceOffGround + l * heightPerLayer,
          },
        });
      }
    }

    return slots;
  }

  getBoardSlots(): meta.RackBoardSlot[] {
    const { distanceOffGround, heightPerLayer, width, depth, height } = this.meta;
    const lLimit = Math.floor(height / heightPerLayer);
    const { x, y, z } = this.position;

    const slots: meta.RackBoardSlot[] = [];

    for (let l = 0; l < lLimit; l++) {
      slots.push({
        layer: l,
        w: width - 10,
        h: depth - 10,
        position: {
          x,
          y,
          z: z + distanceOffGround + l * heightPerLayer,
        },
      });
    }

    return slots;
  }

  static get material() {
    if (!material) {
      material = new LineBasicMaterial({ linewidth: 12, color: 0xf3fadf });
    }
    return material;
  }
}

export class InstancedRack extends InstancedMesh {
  constructor(limit: number, meta: meta.Rack) {
    const geometry = new BufferGeometry();
    const { vertices, indices } = generateVertices(meta);
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);

    super(
      geometry,
      new THREE.MeshBasicMaterial({ color: 0xff8712, transparent: true, opacity: 0.8 }),
      limit,
    );
  }
}

const SHELF_Z_PLANE_INDICES = [0, 1, 1, 2, 2, 3, 3, 0];

let _vertices: any = null;

const generateVertices = (meta: meta.Rack) => {
  if (_vertices) return _vertices;

  const { width, depth, height, distanceOffGround, heightPerLayer } = meta;
  const halfWidth = width / 2;
  const halfDepth = depth / 2;

  const vertices = [];
  const indices = [];

  // ground
  vertices.push(...generateRetangle(halfWidth, halfDepth, 0));

  let z = distanceOffGround;
  let i = 1;

  while (z < height) {
    vertices.push(...generateRetangle(halfWidth, halfDepth, z));
    indices.push(...offset(SHELF_Z_PLANE_INDICES, i * 4));

    // side cross bars
    if (i > 1) {
      if (i % 2) {
        indices.push(i * 4, (i - 1) * 4 + 3, i * 4 + 2, (i - 1) * 4 + 1);
      } else {
        indices.push(i * 4 + 3, (i - 1) * 4, i * 4 + 1, (i - 1) * 4 + 2);
      }
    }

    i += 1;
    z += heightPerLayer;
  }

  vertices.push(...generateRetangle(halfWidth, halfDepth, height));

  // 4 z bars
  indices.push(0, i * 4, 1, i * 4 + 1, 2, i * 4 + 2, 3, i * 4 + 3);

  _vertices = {
    vertices,
    indices,
  };

  return _vertices;
};

const offset = (indices: number[], startAt: number) => {
  return indices.map((i) => i + startAt);
};

let material: LineBasicMaterial = null;
