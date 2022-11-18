import { Interactive } from '../interfaces/Interactive';

export interface InteractiveObject3D extends Interactive, InstanceMeshInstance {
  isInstancedMesh: boolean;
}

export interface InstanceMeshInstance {
  id: number;
  instanceIndex: number;
  $$instanceOf: THREE.InstancedMesh;
  isInstancedMeshInstance: boolean;
}
