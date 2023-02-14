import L from 'leaflet';
import { mix } from '@/model/basic/mixin';
import { ReactiveLayer } from '@/mixins/ReactiveLayer';
import { ReactiveLayerMixin } from '@/mixins/ReactiveLayer.mixin';
import { leafletOptions } from '@/2d/utils/leaflet';

@leafletOptions<L.MarkerOptions>({
  interactive: true,
  draggable: false,
})
export class Marker extends mix(L.Marker).with<L.Marker, ReactiveLayer>(ReactiveLayerMixin) {
  constructor(latlng: L.LatLngExpression, options?: L.MarkerOptions) {
    super(latlng, options);
    this.position = L.latLng(latlng);
  }

  onTransform(snapshot: any): void {
    this.setLatLng(this.position);
  }
}
