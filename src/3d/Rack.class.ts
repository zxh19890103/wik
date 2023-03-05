import THREE from 'three';
import { OnMouseOverOut, OnSelect } from '@/interfaces';
import { InstancedMesh } from './basic';
import { meta } from '@/model';
import { BoardGeometry } from './geometries';

type RackInstanceds = {
  board: RackBoard;
  pile: RackPile;
  pack: RackPack;
};

export class Rack extends THREE.Group {
  private board: RackBoard = null;
  private pile: RackPile = null;
  private pack: RackPack = null;

  static type2instanced: Record<string, RackInstanceds> = {};

  px: number;
  py: number;
  pz: number;

  constructor(position: meta.Position, private meta: meta.Rack) {
    super();

    this.px = position.x;
    this.py = position.y;
    this.pz = position.z;

    this.checkInstanced();
    this.build();
  }

  checkInstanced() {
    let instanced = Rack.type2instanced[this.meta.type];

    if (!instanced) {
      console.log('ha created.');
      const { meta } = this;

      // create
      instanced = {
        board: new RackBoard(meta.width, meta.depth, 100000),
        pile: new RackPile(50, 50, meta.height, 100000),
        pack: new RackPack(meta.width * 0.22, meta.depth, meta.heightPerLayer / 2, 100000),
      };

      Rack.type2instanced[this.meta.type] = instanced;

      this.add(instanced.board);
      this.add(instanced.pile);
      this.add(instanced.pack);
    }

    this.board = instanced.board;
    this.pile = instanced.pile;
    this.pack = instanced.pack;
  }

  build() {
    const { distanceOffGround, height, width, heightPerLayer } = this.meta;

    for (let z = distanceOffGround; z < height; ) {
      const position = {
        x: this.px,
        y: this.py,
        z: this.pz + z,
      };

      this.board.addInstance(position);

      for (let i = 0, x = -width / 2 + 60; x < width / 2; i++) {
        if (x + this.pack.width / 2 > width / 2 - 60) {
          break;
        }

        const position2 = {
          ...position,
          x: position.x + x + this.pack.width / 2,
          z: position.z + this.pack.depth / 2 + 10,
        };

        x += this.pack.width;

        this.pack.addInstance(position2, 0, THREE.MathUtils.randInt(0, 0xffffff));
      }

      z += heightPerLayer;
    }

    this.board.requestUpdate();
    this.pack.requestUpdate();

    const barSize = 30;
    const cornerX = this.meta.width / 2 - barSize;
    const cornerY = this.meta.depth / 2 - barSize;

    for (let i = 0; i < 4; i++) {
      /**
       * 0, 1 1
       * 1, 1 -1
       * 2, -1 -1
       * 3, -1 1
       */
      const position = {
        x: this.px + cornerX * (i < 2 ? 1 : -1),
        y: this.py + cornerY * (i % 3 === 0 ? 1 : -1),
        z: this.pz + this.meta.height / 2 - this.meta.distanceOffGround,
      };

      this.pile.addInstance(position);
    }

    this.pile.requestUpdate();
  }
}

export class RackBoard extends InstancedMesh implements OnMouseOverOut {
  constructor(width: number, depth: number, limit: number) {
    super(
      new BoardGeometry(width, depth),
      new THREE.MeshPhongMaterial({ color: 0xe69a3b, transparent: true, opacity: 0.8 }),
      limit,
    );
  }
  onHover(data?: any) {
    const color = this.getColor();
    this.setColor(0xca10fe);
    return color;
  }

  onUnHover(state?: any, data?: any): void {
    this.setColor(state);
  }
}

export class RackPile extends InstancedMesh {
  constructor(width: number, height: number, depth: number, limit: number) {
    super(
      new THREE.BoxGeometry(width, height, depth, 30),
      new THREE.MeshPhongMaterial({ color: 0x2a58ef, transparent: true, opacity: 0.8 }),
      limit,
    );
  }
}

export class RackPack extends InstancedMesh implements OnMouseOverOut, OnSelect {
  width: number;
  height: number;
  depth: number;

  constructor(width: number, height: number, depth: number, limit: number) {
    super(
      new THREE.BoxGeometry(width, height, depth, 30),
      new THREE.MeshPhongMaterial({ color: 0xd190a0, transparent: true, opacity: 0.8 }),
      limit,
    );

    this.width = width;
    this.height = height;
    this.depth = depth;
  }

  onSelect(data?: any) {
    const color = this.getColor();
    this.setColor(0xffffff);
    return color;
  }

  onUnSelect(state?: any, data?: any): void {
    this.setColor(state);
  }

  onHover(data?: any) {
    const color = this.getColor();
    this.setColor(0x99f100);
    return color;
  }

  onUnHover(state?: any, data?: any): void {
    this.setColor(state);
  }
}
