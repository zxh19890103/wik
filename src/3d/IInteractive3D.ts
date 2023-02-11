import { Interactive } from '../interfaces/Interactive';

export interface InteractiveObject3D extends Interactive, InstanceMeshInstance {
  isInstancedMesh: boolean;
}

export interface InstanceMeshInstance {
  id: number;
  instanceIndex: number;
  position: THREE.Vector3;
  color: number;
  $$instanceOf: THREE.InstancedMesh;
  isInstancedMeshInstance: boolean;
  /**
   * 数据模型
   */
  model: any;
}
