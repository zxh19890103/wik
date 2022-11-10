import THREE from 'three';
import { InstanceMeshInstance } from '../IInteractive3D';

export class InstancedMesh extends THREE.InstancedMesh {
  private instances: Map<number, any> = new Map();
  readonly isInstancedMeshInstance: boolean = false;
  readonly $$instanceOf: InstancedMesh = null;

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
}
