import L from 'leaflet';
import { leafletOptions } from './utils';
import { ReactSVGOverlayAppServer, ReactSVGOverlay } from './basic';
import ImageSVG from './basic/Image.svg';
import { meta } from '@/model';
import * as svg from './images';

@leafletOptions<L.ImageOverlayOptions>({})
export class Haiport extends ReactSVGOverlay {
  constructor(
    latlng: L.LatLngExpression,
    meta: meta.Haiport,
    svgServer: ReactSVGOverlayAppServer = null,
  ) {
    super(ImageSVG, latlng, 1000, 1000, svgServer);
    this.svgStyle = {};
    this.svgData = {
      imageURL: meta?.type === 'OUT' ? svg.SVG_HAIPORT_D : svg.SVG_HAIPORT_D,
    };
  }
}
