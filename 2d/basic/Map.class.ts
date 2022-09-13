import L from 'leaflet';
import { ClickCancelMix, WithClickCancel } from '../../mixins/ClickCancel';
import { mixin } from '../../model/basic';
import { leafletOptions } from '../../utils/leaflet';
import { HR_CRS, INITIAL_ZOOM_LEVEL } from './CRS';

/**
 *   contextmenu: true,
  contextmenuWidth: 140,
  contextmenuItems: [],
 */

@leafletOptions<L.MapOptions>({
  dragging: true,
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
  attributionControl: false,
  preferCanvas: true,
  tapTolerance: 100,
})
@mixin(ClickCancelMix)
export class HrMap extends L.Map {}

export interface HrMap extends WithClickCancel {
  _container: HTMLDivElement;
}
