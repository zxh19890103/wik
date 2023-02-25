import L from 'leaflet';
import { ReactiveLayer, ReactiveLayerMixin, ReactiveLayerRenderEffect } from '@/mixins';
import { mix } from '@/model';
import { leafletOptions } from '../utils/leaflet';
import { default_path_style } from './constants';
import { WithLayerState } from '@/interfaces';

@leafletOptions<L.CircleMarkerOptions>({
  ...default_path_style,
  radius: 400,
})
export class Circle<S = {}> extends mix(L.Circle).with<L.Circle, ReactiveLayer>(
  ReactiveLayerMixin,
) {
  constructor(latlng: L.LatLngExpression, options?: L.CircleMarkerOptions) {
    super(latlng, options);
    this.position = L.latLng(latlng);
  }
}

export interface Circle<S = {}> extends WithLayerState<S> {}
