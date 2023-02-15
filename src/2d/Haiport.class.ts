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
