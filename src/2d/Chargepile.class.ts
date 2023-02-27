import L from 'leaflet';
import { leafletOptions } from './utils';
import { ReactSVGOverlay } from './basic/ReactSVGOverlay.class';
import ImageSVG from './basic/Image.svg';
import { meta } from '@/model';
import svgURL from './images/chargepile.svg';
import { ReactSVGOverlayAppServer } from './basic/ReactSVGOverlayApp';

@leafletOptions<L.ImageOverlayOptions>({})
export class Chargepile extends ReactSVGOverlay {
  readonly anglePhase = 0;

  constructor(
    latlng: L.LatLngExpression,
    meta: meta.Chargepile,
    svgServer: ReactSVGOverlayAppServer = null,
  ) {
    super(ImageSVG, latlng, 1000, 1000, svgServer);
    this.svgStyle = { strokeDasharray: 4, strokeWidth: 1 };
    this.svgData = { imageURL: svgURL };
    this.angle = meta?.angle || 0;
  }
}
