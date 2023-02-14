import L from 'leaflet';
import { leafletOptions } from './utils';
import { Rectangle } from './basic';
import type * as meta from '@/model/meta';

@leafletOptions<L.PolylineOptions>({
  color: '#f00',
  opacity: 1,
  fillColor: '#f80',
  fillOpacity: 1,
  noClip: true,
})
export class ConveyorNode extends Rectangle {
  constructor(latlng: L.LatLngExpression, meta?: meta.ConveyorNode) {
    super(latlng, 320, 320, {
      fillColor: meta?.type === 'OUT' ? '#000' : '#098',
    });
  }
}
