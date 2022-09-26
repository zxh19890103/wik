import L from 'leaflet';

export const boundToLatLngs = (latLngBoundsExpr: any) => {
  const bounds = L.latLngBounds(latLngBoundsExpr);
  return [
    bounds.getSouthWest(),
    bounds.getNorthWest(),
    bounds.getNorthEast(),
    bounds.getSouthEast(),
  ];
};
