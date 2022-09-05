import L from 'leaflet';
import { ReactiveLayer } from '../../mixins/ReactiveLayer';
import { ReactiveLayerMixin } from '../../mixins/ReactiveLayer.mixin';
import { mix } from '../../model/basic/mixin';
import { leafletOptions } from '../../utils/leaflet';
import { mapLatLng } from '../../utils/mapLatLng';
import { EMPTY_BOUNDS } from './constants';

@leafletOptions<L.PolylineOptions>({
  color: '#fa0087',
  opacity: 1,
  fillColor: '#f09d2a',
  fillOpacity: 1,
})
export class Rectangle extends mix(L.Rectangle).with<L.Rectangle, ReactiveLayer>(
  ReactiveLayerMixin,
) {
  constructor(latlng: L.LatLngExpression, l: number, w: number, options?: L.PolylineOptions) {
    super(EMPTY_BOUNDS, options);
    this.position = L.latLng(latlng);
    this.setLocalBounds([
      [-l / 2, -w / 2],
      [l / 2, w / 2],
    ]);
  }

  onMouseOver(e: L.LeafletMouseEvent): void {
    this.setAngle(45);
  }

  onMouseOut(e: L.LeafletMouseEvent): void {
    this.setAngle(0);
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
