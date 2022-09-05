import { Base, View, ViewContainer, ViewMake } from '../model/basic/Base.class';

export class ThreeContainer<M extends Base, V extends View<M>>
  implements ViewContainer<M, V, THREE.Group>
{
  $$make: ViewMake<M, V> = null;
  $$value: THREE.Group = null;

  constructor(value: THREE.Group, make: ViewMake<M, V>, ...initialItems: M[]) {
    this.$$value = value;
    this.$$make = make;

    this.add(...initialItems.map(make));
  }

  add(...items: V[]): void {
    for (const item of items) {
      this.$$value.add(item as unknown as THREE.Object3D);
    }
  }

  remove(...items: V[]): void {
    this.$$value.remove(...(items as unknown[] as THREE.Object3D[]));
  }
}
