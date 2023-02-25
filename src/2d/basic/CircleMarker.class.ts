import L from 'leaflet';
import { ReactiveLayer, ReactiveLayerMixin } from '@/mixins';
import { mix } from '@/model';
import { leafletOptions } from '../utils';
import { default_path_style } from './constants';
import { WithLayerState } from '@/interfaces';

@leafletOptions<L.CircleMarkerOptions>({
  ...default_path_style,
  radius: 100,
})
export class CircleMarker<S = {}> extends mix(L.CircleMarker).with<L.CircleMarker, ReactiveLayer>(
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

export interface CircleMarker<S = {}> extends WithLayerState<S> {}
