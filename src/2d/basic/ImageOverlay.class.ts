import L from 'leaflet';
import { ReactiveLayer, ReactiveLayerMixin } from '@/mixins';
import { alias, mix } from '@/model';
import { leafletOptions } from '../utils';
import { empty_bounds } from './constants';
import { WithLayerState } from '@/interfaces';

@leafletOptions<L.ImageOverlayOptions>({
  interactive: true,
  bubblingMouseEvents: false,
})
@alias('_reset', 'redraw')
export class ImageOverlay<S = {}> extends mix(L.ImageOverlay).with<L.ImageOverlay, ReactiveLayer>(
  ReactiveLayerMixin,
) {
  private size: L.PointTuple;

  constructor(
    latlng: L.LatLngExpression,
    imageUrl: string,
    size: L.PointTuple,
    options?: L.ImageOverlayOptions,
  ) {
    super(imageUrl, empty_bounds, options);
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

export interface ImageOverlay<S = {}> extends WithLayerState<S> {
  _image: any;
  _bounds: L.LatLngBounds;
  redraw(): void;
}
