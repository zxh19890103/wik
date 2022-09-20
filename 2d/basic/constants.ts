export const EMPTY_BOUNDS = [
  [0, 0],
  [0, 0],
] as L.LatLngBoundsExpression;

export const BUILTIN_LEAFLET_PANES =
  'mapPane,tilePane,overlayPane,shadowPane,markerPane,tooltipPane,popupPane';

export const DEFAULT_PATH_STYLE: L.PolylineOptions = {
  color: '#004caa',
  opacity: 1,
  fillColor: '#004caa',
  fillOpacity: 0.6,
  fill: false,
  weight: 1,
};
