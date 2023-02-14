import L from 'leaflet';
import { ClickCancelMix, WithClickCancel } from '@/mixins/ClickCancel';
import { deco$$ } from '@/model';
import { leafletOptions } from '../utils/leaflet';
import { HR_CRS, INITIAL_ZOOM_LEVEL } from './CRS';

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
export class WikMap extends L.Map {}

export interface WikMap extends WithClickCancel {
  _container: HTMLDivElement;
}
