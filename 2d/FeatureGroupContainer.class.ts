import { Base, View, ViewContainer, ViewMake } from '../model/basic/Base.class';

export class FeatureGroupContainer<M extends Base, V extends View<M>>
  implements ViewContainer<M, V, L.FeatureGroup>
{
  $$make: ViewMake<M, V>;
  $$value: L.FeatureGroup;

  constructor(value: L.FeatureGroup, make: ViewMake<M, V>, ...initialItems: M[]) {
    this.$$value = value;
    this.$$make = make;

    this.add(...initialItems.map(make));
  }

  add(...items: V[]): void {
    for (const item of items) {
      this.$$value.addLayer(item as unknown as L.Layer);
    }
  }

  remove(...items: V[]): void {
    for (const item of items) {
      this.$$value.removeLayer(item as unknown as L.Layer);
    }
  }
}
