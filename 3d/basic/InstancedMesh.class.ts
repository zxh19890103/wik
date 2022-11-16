import THREE from 'three';
import { InstanceMeshInstance } from '../IInteractive3D';

const _color = new THREE.Color();
const _identity = new THREE.Matrix4();

export class InstancedMesh extends THREE.InstancedMesh {
  private instances: Map<number, any> = new Map();
  readonly isInstancedMeshInstance: boolean = false;
  readonly $$instanceOf: InstancedMesh = null;

  constructor(geometry: THREE.BufferGeometry, material: THREE.Material, count: number) {
    super(geometry, material, count);

    for (let i = 0; i < count; i++) {
      this.setColorAt(i, _color);
    }
  }

  getInstanceAt<T extends InstanceMeshInstance = InstanceMeshInstance>(id: number): T {
    if (this.instances.has(id)) {
      return this.instances.get(id);
    }

    // create
    const instance = Object.create(this, {
      id: { value: id, writable: false, configurable: false, enumerable: false },
    });

    instance.$$instanceOf = this;
    instance.isInstancedMeshInstance = true;

    this.instances.set(id, instance);

    return instance;
  }

  addInstanceAt(id: number, color: THREE.ColorRepresentation, position: THREE.Vector3) {}

  deleteInstanceAt(id: number) {}
}
