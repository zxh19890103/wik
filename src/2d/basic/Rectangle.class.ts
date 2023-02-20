import L from 'leaflet';
import { ReactiveLayer, ReactiveLayerMixin } from '@/mixins';
import { deco$$ } from '@/model';
import { leafletOptions, mapLatLng } from '../utils';
import { default_path_style, empty_bounds } from './constants';

@leafletOptions<L.PolylineOptions>(default_path_style)
export class Rectangle extends deco$$
  .mix(L.Rectangle)
  .with<L.Rectangle, ReactiveLayer>(ReactiveLayerMixin) {
  constructor(latlng: L.LatLngExpression, l: number, w: number, options?: L.PolylineOptions) {
    super(empty_bounds, options);
    this.position = L.latLng(latlng);
    this.setLocalBounds([
      [-l / 2, -w / 2],
      [l / 2, w / 2],
    ]);
  }

  onTransform(snapshot: any): void {
    this.setLatLngs(
      mapLatLng(
        this.latlngs,
        (latlng, _latlng) => {
          return this.localToWorld(latlng);
        },
        (this as any)._latlngs,
      ),
    );
  }
}
