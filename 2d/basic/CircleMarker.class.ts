import L from 'leaflet';
import { AnyObject } from '../../interfaces/types';
import { ReactiveLayer } from '../../mixins/ReactiveLayer';
import { ReactiveLayerMixin } from '../../mixins/ReactiveLayer.mixin';
import { WithLayerState } from '../../interfaces/WithLayerState';
import { mix } from '../../model/basic/mixin';
import { leafletOptions } from '../../utils/leaflet';

@leafletOptions<L.CircleMarkerOptions>({
  color: '#fa0087',
  opacity: 1,
  fillColor: '#f09d2a',
  fillOpacity: 1,
  radius: 10,
})
export class CircleMarker extends mix(L.CircleMarker).with<L.CircleMarker, ReactiveLayer>(
  ReactiveLayerMixin,
) {
  constructor(latlng: L.LatLngExpression, options?: L.CircleMarkerOptions) {
    super(latlng, options);
    this.position = L.latLng(latlng);
  }

  onTransform(snapshot: any): void {
    this.setLatLng(this.position);
  }
}
