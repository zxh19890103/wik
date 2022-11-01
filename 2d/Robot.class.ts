import L from 'leaflet';
import { leafletOptions } from '../utils/leaflet';
import { ReactSVGOverlayAppServer } from './basic';
import { ReactSVGOverlay } from './basic/ReactSVGOverlay.class';
import ImageSVG from './basic/Image.svg';
import type * as meta from '../model/meta';
import * as svg from './images';

@leafletOptions<L.ImageOverlayOptions>({})
export class Robot extends ReactSVGOverlay {
  constructor(svgServer: ReactSVGOverlayAppServer, meta?: meta.Robot) {
    super(ImageSVG, svgServer, 1000, 1000);
    this.svgStyle = { strokeDasharray: 4, strokeWidth: 1 };
    this.svgData = {
      imageURL: meta?.type === 'kiva' ? svg.SVG_KIVA : svg.SVG_KUBOT,
    };
    this.svgStyleElement = 'circle';
  }
}
