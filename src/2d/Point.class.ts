import L from 'leaflet';
import { leafletOptions } from '../2d/utils';
import { Circle } from './basic';
import type * as meta from '@/model/meta';

@leafletOptions<L.CircleMarkerOptions>({
  color: '#d9d9d9',
  opacity: 1,
  fillColor: '#d9d9d9',
  fillOpacity: 1,
  radius: 100,
})
export class Point extends Circle {
  type: meta.PointPresetType = 'normal';

  constructor(latlng: L.LatLngExpression, meta?: meta.Point) {
    super(latlng, {});
    this.type = meta?.type || 'normal';
    this.position = L.latLng(latlng);
  }
}
