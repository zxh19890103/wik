import L from 'leaflet';
import { leafletOptions } from '../utils/leaflet';
import { ReactSVGOverlayAppServer } from './basic';
import { ReactSVGOverlay } from './basic/ReactSVGOverlay.class';
import ImageSVG from './basic/Image.svg';
import type { meta } from '../model/meta';
import { WithInput } from '../interfaces/WithInput';
import svgURL from './images/chargepile.svg';

@leafletOptions<L.ImageOverlayOptions>({})
export class Chargepile extends ReactSVGOverlay implements WithInput {
  readonly angleOffset = -90;

  constructor(
    latlng: L.LatLngExpression,
    svgServer: ReactSVGOverlayAppServer,
    meta?: meta.Chargepile,
  ) {
    super(ImageSVG, svgServer, 1000, 1000);
    this.svgStyle = { strokeDasharray: 4, strokeWidth: 1 };
    this.svgData = { imageURL: svgURL };
    this.position = L.latLng(latlng);
    this.angle = meta?.angle || 0;
  }

  onInitInput?(data: any): void {
    throw new Error('Method not implemented.');
  }

  onInput(data: any): void {
    if (data.error) {
      this.setSVGStyle({ fill: '#f09' });
    } else {
      this.setSVGStyle({ fill: '#0f9' });
    }
  }

  onClick() {
    this.rotate(10);
  }
}
