import L from 'leaflet';
import { ReactiveLayer } from '@/mixins/ReactiveLayer';
import { ReactiveLayerMixin } from '@/mixins/ReactiveLayer.mixin';
import { deco$$ } from '@/model';
import { leafletOptions } from '../utils/leaflet';
import { DEFAULT_PATH_STYLE } from './constants';

@leafletOptions<L.CircleMarkerOptions>({
  ...DEFAULT_PATH_STYLE,
  radius: 400,
})
export class Circle extends deco$$.mix(L.Circle).with<L.Circle, ReactiveLayer>(ReactiveLayerMixin) {
  constructor(latlng: L.LatLngExpression, options?: L.CircleMarkerOptions) {
    super(latlng, options);
    this.position = L.latLng(latlng);
  }
}
