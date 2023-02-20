import { ConfigProviderConfigValue, HighlightManager, interfaces, ModeManager } from '@/model';
import { AnimationManager } from '../animation';
import { ImageManager, PaneManager } from '../state';

export const empty_bounds = [
  [0, 0],
  [0, 0],
] as L.LatLngBoundsExpression;

export const leaflet_buitlin_panes =
  'mapPane,tilePane,overlayPane,shadowPane,markerPane,tooltipPane,popupPane';

export const default_path_style: L.PolylineOptions = Object.freeze({
  color: '#004caa',
  opacity: 1,
  fillColor: null,
  fillOpacity: 1,
  fill: false,
  weight: 1,
});

export const default_warehouse_deps: Record<symbol, ConfigProviderConfigValue> = {
  [interfaces.IPaneManager]: PaneManager,
  [interfaces.IModeManager]: ModeManager,
  [interfaces.IAnimationManager]: AnimationManager,
  [interfaces.IHighlightManager]: HighlightManager,
  [interfaces.IImageManager]: ImageManager,
};
