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
    svgServer?: ReactSVGOverlayAppServer,
    meta?: meta.Chargepile,
  ) {
    super(ImageSVG, svgServer, 1000, 1000);
    this.svgStyle = { strokeDasharray: 4, strokeWidth: 1 };
    this.svgData = { imageURL: svgURL };
    this.position = L.latLng(latlng);
    this.angle = meta?.angle || 0;
  }
}
