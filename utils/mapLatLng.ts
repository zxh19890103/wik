import L from 'leaflet';
import { PolylineLatLngs } from '../interfaces/types';

export const mapLatLng = (
  latlngs: PolylineLatLngs,
  mapFn: (item: L.LatLng, anotherItem?: L.LatLngExpression) => L.LatLngExpression,
  anotherLatlngs?: PolylineLatLngs,
): PolylineLatLngs => {
  if (!latlngs) return [];
  return latlngs.map((item, index) => {
    const anotherItem = anotherLatlngs ? (anotherLatlngs[index] as any) : null;
    if (typeof item.lat === 'number' || typeof item[0] === 'number') {
      return mapFn(L.latLng(item), anotherItem);
    }
    // Or It's a nested latlngs.
    return mapLatLng(item, mapFn, anotherItem) as any;
  });
};

export function eachLatLng(latlngs: PolylineLatLngs, iter: (latlng: L.LatLngExpression) => void) {
  for (const item of latlngs) {
    if (item instanceof Array) eachLatLng(item as PolylineLatLngs, iter);
    else iter(item as L.LatLngExpression);
  }
}
