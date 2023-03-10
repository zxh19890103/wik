import L from 'leaflet';
import { leafletOptions } from '../2d/utils';
import { Marker } from './basic/Marker.class';
import { meta } from '@/model';
import * as svg from './images';

@leafletOptions<L.MarkerOptions>({})
export class Location extends Marker {
  type: meta.LocationType = 'rest';

  constructor(latlng: L.LatLngExpression, meta?: meta.Location) {
    super(latlng, {
      ...createDefaultOptions(meta || { type: 'labor' }),
    });

    this.type = meta?.type || 'rest';
  }
}

const createDefaultOptions = (meta: meta.Location): L.MarkerOptions => {
  if (!meta) {
    return {};
  }

  const iconURL = meta.iconURL || null;

  switch (meta.type) {
    case 'labor':
      return {
        icon: new L.Icon({
          className: 'wik-marker-icon',
          iconUrl: iconURL || svg.SVG_CHARGEPILE,
          shadowUrl: null,
          shadowAnchor: [5, 20],
        }),
      };
    default:
      return {
        icon: new L.Icon({
          iconUrl: iconURL,
        }),
      };
  }
};
