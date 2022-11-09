import { Interactive } from '../interfaces/Interactive';

/**
 * This is a fake obj3d for select need.
 */
export interface Interactive3D extends Interactive {
  obj3d: InteractiveObject3D;
  isInstancedMesh: boolean;
  instanceId?: number;
}

export interface InteractiveObject3D extends Interactive {
  isInstancedMesh: boolean;
}
