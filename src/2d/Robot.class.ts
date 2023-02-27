import L from 'leaflet';
import { leafletOptions } from './utils';
import { ReactSVGOverlay } from './basic/ReactSVGOverlay.class';
import { ReactSVGOverlayAppServer } from './basic/ReactSVGOverlayApp';
import ImageSVG from './basic/Image.svg';
import { meta } from '@/model';
import * as svg from './images';

@leafletOptions<L.ImageOverlayOptions>({})
export class Robot extends ReactSVGOverlay {
  constructor(meta: meta.Robot, svgServer: ReactSVGOverlayAppServer = null) {
    super(ImageSVG, [0, 0], 1000, 1000, svgServer);
    this.svgStyle = { strokeDasharray: 4, strokeWidth: 1 };
    this.svgData = {
      imageURL: meta?.type === 'kiva' ? svg.SVG_KIVA : svg.SVG_KUBOT,
    };
    this.svgStyleElement = 'circle';
  }
}
