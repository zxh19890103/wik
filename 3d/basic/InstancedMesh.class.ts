import THREE from 'three';
import { InstanceMeshInstance } from '../IInteractive3D';

const _color = new THREE.Color();
const _identity = new THREE.Matrix4();

let __instance__id__seed__ = 1990;
export class InstancedMesh extends THREE.InstancedMesh {
  private instances: Map<number, any> = new Map();
  readonly isInstancedMeshInstance: boolean = false;
  readonly $$instanceOf: InstancedMesh = null;
  instanceIndex = -1;

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

    return this.createInstance() as unknown as T;
  }

  addInstanceAt(index: number, color: number | string, position: THREE.Vector3) {
    const instance = this.createInstance();

    instance.setColor(color);
    instance.setPosition(position);

    instance.instanceIndex = index;

    return instance;
  }

  deleteInstanceAt(id: number) {}

  private createInstance() {
    const id = __instance__id__seed__++;
    // create
    const instance = Object.create(this, {
      id: { value: id, writable: false, configurable: false, enumerable: false },
    });

    instance.$$instanceOf = this;
    instance.isInstancedMeshInstance = true;

    this.instances.set(id, instance);

    return instance as InstancedMesh;
  }

  setPosition(position: THREE.Vector3) {
    _identity.setPosition(position);
    this.setMatrixAt(this.instanceIndex, _identity);
    this.instanceMatrix.needsUpdate = true;
  }

  setColor(color: number | string) {
    this.setColorAt(this.instanceIndex, new THREE.Color(color));
    this.instanceColor.needsUpdate = true;
  }
}
