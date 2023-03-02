import L from 'leaflet';
import { deco$$, ClickCancelMix, WithClickCancel } from '@/model';
import { leafletOptions } from '../utils';
import { HR_CRS, INITIAL_ZOOM_LEVEL } from './CRS';
import { PaneManager } from '../state';

@leafletOptions<L.MapOptions>({
  dragging: false,
  boxZoom: false,
  crs: HR_CRS,
  center: [0, 0],
  keyboard: false,
  zoomDelta: 0.1,
  zoomSnap: 0.1,
  zoomAnimation: true,
  inertia: true,
  zoom: INITIAL_ZOOM_LEVEL,
  minZoom: -10,
  maxZoom: 10,
  zoomControl: false,
  doubleClickZoom: false,
  attributionControl: true,
  preferCanvas: true,
  tapTolerance: 100,
})
@deco$$.mixin(ClickCancelMix)
export class WikMap extends L.Map {
  readonly paneMgr: PaneManager;
  __canvas_renderers_size__ = 0;
}

export interface WikMap extends WithClickCancel {
  _container: HTMLDivElement;
  _fireDOMEvent: (...args) => void;
}
