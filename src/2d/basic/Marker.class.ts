import L from 'leaflet';
import { mix } from '@/model';
import { ReactiveLayer, ReactiveLayerMixin } from '@/mixins';
import { leafletOptions } from '../utils/leaflet';
import { WithLayerState } from '@/interfaces';

import * as images from '../images';
import { ReactiveLayerRenderingMode } from '@/mixins/ReactiveLayer';

@leafletOptions<L.MarkerOptions>({
  interactive: true,
  draggable: false,
  icon: new L.Icon({
    className: 'debug-bordered',
    iconUrl: images.SVG_CHARGEPILE,
    iconSize: [32, 32],
  }),
})
export class Marker<S = {}> extends mix(L.Marker).with<L.Marker, ReactiveLayer>(
  ReactiveLayerMixin,
) {
  readonly renderingMode: ReactiveLayerRenderingMode = 'marker';

  constructor(latlng: L.LatLngExpression, options?: L.MarkerOptions) {
    super(latlng, options);
    this.position = L.latLng(latlng);
  }
}

export interface Marker<S = {}> extends WithLayerState<S> {
  _icon: HTMLElement;
}
