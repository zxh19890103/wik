import L from 'leaflet';

/**
 *
 * @param latLngBoundsExpr
 * @returns
 */
export const boundToLatLngs = (latLngBoundsExpr: any): L.LatLng[] => {
  const bounds = L.latLngBounds(latLngBoundsExpr);

  const { _northEast, _southWest } = bounds;

  return [_northEast, bounds.getNorthWest(), _southWest, bounds.getSouthEast()];
};
