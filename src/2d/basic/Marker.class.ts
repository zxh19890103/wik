import L from 'leaflet';
import { mix } from '@/model';
import { ReactiveLayer, ReactiveLayerMixin } from '@/mixins';
import { leafletOptions } from '../utils/leaflet';
import { WithLayerState } from '@/interfaces';

@leafletOptions<L.MarkerOptions>({
  interactive: true,
  draggable: false,
})
export class Marker<S = {}> extends mix(L.Marker).with<L.Marker, ReactiveLayer>(
  ReactiveLayerMixin,
) {
  constructor(latlng: L.LatLngExpression, options?: L.MarkerOptions) {
    super(latlng, options);
    this.position = L.latLng(latlng);
  }

  onTransform(snapshot: any): void {
    this.setLatLng(this.position);
  }
}

export interface Marker<S = {}> extends WithLayerState<S> {}
