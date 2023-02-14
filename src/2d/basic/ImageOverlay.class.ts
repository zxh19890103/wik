import L from 'leaflet';
import { ReactiveLayer } from '@/mixins/ReactiveLayer';
import { ReactiveLayerMixin } from '@/mixins/ReactiveLayer.mixin';
import { deco$$ } from '@/model';
import { leafletOptions } from '../utils';
import { EMPTY_BOUNDS } from './constants';

@leafletOptions<L.ImageOverlayOptions>({
  interactive: true,
  bubblingMouseEvents: false,
})
@deco$$.alias('_reset', 'redraw')
export class ImageOverlay extends deco$$
  .mix(L.ImageOverlay)
  .with<L.ImageOverlay, ReactiveLayer>(ReactiveLayerMixin) {
  private size: L.PointTuple;

  constructor(
    latlng: L.LatLngExpression,
    imageUrl: string,
    size: L.PointTuple,
    options?: L.ImageOverlayOptions,
  ) {
    super(imageUrl, EMPTY_BOUNDS, options);
    this.position = L.latLng(latlng);
    this.size = size;
  }

  onRender() {
    const { lat: y, lng: x } = this.position;
    const [sX, sY] = this.size;
    this._bounds = new L.LatLngBounds([-sY / 2 + y, -sX / 2 + x], [sY / 2 + y, sX / 2 + x]);
    if (!this._image || !this._map) return;
    this.redraw();
  }
}

export interface ImageOverlay {
  _image: any;
  _bounds: L.LatLngBounds;
  redraw(): void;
}
