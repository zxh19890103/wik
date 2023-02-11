import L from 'leaflet';

/**
 *
 * @param latLngBoundsExpr
 * @returns
 */
export const boundToLatLngs = (
  latLngBoundsExpr: any,
  transtion?: L.LatLngExpression,
): L.LatLng[] => {
  const bounds = L.latLngBounds(latLngBoundsExpr);

  const { _northEast, _southWest } = bounds;

  const _northWest = bounds.getNorthWest();
  const _southEast = bounds.getSouthEast();

  const latlngs = [_northEast, _northWest, _southWest, _southEast];

  if (transtion) {
    const { lat, lng } = L.latLng(transtion);
    for (const latlng of latlngs) {
      latlng.lat += lat;
      latlng.lng += lng;
    }
  }

  return latlngs;
};
