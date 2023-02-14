import L from 'leaflet';
import { ReactiveLayer, ReactiveLayerMixin } from '@/mixins';
import { deco$$ } from '@/model';
import { leafletOptions, mapLatLng } from '../utils';
import { DEFAULT_PATH_STYLE, EMPTY_BOUNDS } from './constants';

@leafletOptions<L.PolylineOptions>(DEFAULT_PATH_STYLE)
export class Rectangle extends deco$$
  .mix(L.Rectangle)
  .with<L.Rectangle, ReactiveLayer>(ReactiveLayerMixin) {
  constructor(latlng: L.LatLngExpression, l: number, w: number, options?: L.PolylineOptions) {
    super(EMPTY_BOUNDS, options);
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
