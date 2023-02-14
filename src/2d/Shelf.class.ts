import L from 'leaflet';
import { leafletOptions } from './utils';
import { Rectangle } from './basic';
import type * as meta from '@/model/meta';

@leafletOptions<L.PolylineOptions>({
  color: '#d9d9d9',
  opacity: 1,
  fillColor: '#f2f2f2',
  fillOpacity: 1,
})
export class Shelf extends Rectangle {
  constructor(latlng: L.LatLngExpression, meta: meta.Rack) {
    super(latlng, meta.depth, meta.width);
    this.position = L.latLng(latlng);
    this.angle = meta.angle || 0;
  }
}
