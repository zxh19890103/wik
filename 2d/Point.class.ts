import L from 'leaflet';
import { leafletOptions } from '../utils/leaflet';
import { Circle } from './basic';
import type { meta } from '../model/meta';

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
    super(latlng, {
      ...createCircleStyle(meta?.type),
    });
    this.type = meta?.type || 'normal';
    this.position = L.latLng(latlng);
  }

  onMouseOver(evt: L.LeafletMouseEvent): void {
    this.setStyle({ fillColor: '#999' });
  }

  onMouseOut(evt: L.LeafletMouseEvent): void {
    this.setStyle({ fillColor: '#d9d9d9' });
  }

  drawArrowTo(p: Point) {
    return L.polyline([this.position, p.position]).addTo(this._map);
  }
}

const createCircleStyle = (t: meta.PointPresetType): L.CircleMarkerOptions => {
  switch (t) {
    case 'rest':
      return {
        fillColor: '#542',
      };
    case 'charge':
      return {
        fillColor: '#a0d',
      };
    case 'normal':
    default:
      return {
        fillColor: '#d9d9d9',
      };
  }
};
