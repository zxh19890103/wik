import L from 'leaflet';
import { ReactiveLayer, ReactiveLayerMixin } from '@/mixins';
import { mix } from '@/model';
import { leafletOptions } from '../utils/leaflet';
import { DEFAULT_PATH_STYLE } from './constants';

@leafletOptions<L.CircleMarkerOptions>({
  ...DEFAULT_PATH_STYLE,
  radius: 400,
})
export class Circle extends mix(L.Circle).with<L.Circle, ReactiveLayer>(ReactiveLayerMixin) {
  constructor(latlng: L.LatLngExpression, options?: L.CircleMarkerOptions) {
    super(latlng, options);
    this.position = L.latLng(latlng);
  }
}
