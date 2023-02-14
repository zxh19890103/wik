import L from 'leaflet';
import { ReactiveLayer } from '@/mixins/ReactiveLayer';
import { ReactiveLayerMixin } from '@/mixins/ReactiveLayer.mixin';
import { deco$$ } from '@/model';
import { leafletOptions } from '@/2d/utils/leaflet';
import { DEFAULT_PATH_STYLE } from './constants';

@leafletOptions<L.CircleMarkerOptions>({
  ...DEFAULT_PATH_STYLE,
  radius: 100,
})
export class CircleMarker extends deco$$
  .mix(L.CircleMarker)
  .with<L.CircleMarker, ReactiveLayer>(ReactiveLayerMixin) {
  constructor(latlng: L.LatLngExpression, options?: L.CircleMarkerOptions) {
    super(latlng, options);
    this.position = L.latLng(latlng);
  }

  onTransform(snapshot: any): void {
    this.setLatLng(this.position);
  }
}
