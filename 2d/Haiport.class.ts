import L from 'leaflet';
import { leafletOptions } from '../utils/leaflet';
import { ReactSVGOverlayAppServer } from './basic';
import { ReactSVGOverlay } from './basic/ReactSVGOverlay.class';
import ImageSVG from './basic/Image.svg';
import type * as meta from '../model/meta';
import * as svg from '../2d/images';

@leafletOptions<L.ImageOverlayOptions>({})
export class Haiport extends ReactSVGOverlay {
  constructor(
    latlng: L.LatLngExpression,
    svgServer?: ReactSVGOverlayAppServer,
    meta?: meta.Haiport,
  ) {
    super(ImageSVG, svgServer, 1000, 1000);
    this.svgStyle = {};
    this.svgData = {
      imageURL: meta?.type === 'OUT' ? svg.SVG_HAIPORT_D : svg.SVG_HAIPORT_D,
    };
    this.position = L.latLng(latlng);
  }
}
