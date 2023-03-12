import L from 'leaflet';
import { WikDraggable } from './Draggable.class';
import { WikMap } from './Map.class';
import { empty_bounds } from './constants';
import { leafletOptions } from '../utils';
import { mix, alias } from '@/model';
import { ReactiveLayer, ReactiveLayerMixin, ReactiveLayerRenderEffect } from '@/mixins';
import { WithLayerState } from '@/interfaces';
import { ReactiveLayerRenderingMode } from '@/mixins/ReactiveLayer';

@leafletOptions<L.ImageOverlayOptions>({
  interactive: true,
  bubblingMouseEvents: false,
})
@alias('_reset', 'redraw')
export class SVGOverlay<S = {}> extends mix(L.SVGOverlay).with<L.SVGOverlay, ReactiveLayer>(
  ReactiveLayerMixin,
) {
  readonly renderingMode: ReactiveLayerRenderingMode = 'overlay';

  private _size: L.Point = null;
  /**
   * the size before changed.
   */
  __preSize: L.Point = null;

  get size(): L.Point {
    return this._size;
  }

  /**
   * no reactive, if you mean react, use setSize instead.
   */
  set size(val: L.PointExpression) {
    this.__preSize = this._size;
    this._size = L.point(val);
  }

  constructor(
    el: string | SVGElement,
    position: L.LatLngExpression,
    sizeX: number,
    sizeY: number,
    options?: L.ImageOverlayOptions,
  ) {
    super(el, empty_bounds, options);
    this.position = L.latLng(position);
    this.size = new L.Point(sizeX, sizeY);
  }

  /**
   * 与属性 size 不同的是，它会触发渲染
   */
  setSize(x: number | L.Point, y?: number) {
    this.size = x instanceof L.Point ? x : new L.Point(x, y);
    this.requestRenderCall(ReactiveLayerRenderEffect.size);
  }

  getCientSize() {
    return {
      x: this._size.x * this.scale.lng,
      y: this._size.y * this.scale.lat,
    };
  }

  protected computesSvgBoxRadius() {
    const { x, y } = this.getCientSize();
    const hx = x / 2;
    const hy = y / 2;
    return Math.ceil(Math.sqrt(hx * hx + hy * hy));
  }

  /**
   * includes：viewbox/style/root G transform
   * @param scale means
   * @returns
   */
  getSVGLayout() {
    const r = this.computesSvgBoxRadius();
    const size = r * 2;

    const { lat, lng } = this.scale;

    return {
      size,
      r,
      transform: this.getVisibleObjectTransformStyle(r, lng, lat),
      viewbox: `0 0 ${size} ${size}`,
    };
  }

  /**
   * svg 内可见物体（角度为 0 的时候）的位置
   * @param r 为 svg 的窗口尺寸
   */
  computesVisibleObjectOffset(boxRadius: number) {
    const { x, y } = this.getCientSize();
    return [boxRadius - x / 2, boxRadius - y / 2];
  }

  leafletRender() {
    const r = this.computesSvgBoxRadius();
    const { lat, lng } = this.localToWorld([0, 0]);
    this._bounds = new L.LatLngBounds([-r + lat, -r + lng], [r + lat, r + lng]);
    if (!this._image || !this._map) return;
    this.redraw();
  }

  /**
   *
   * @param scale We use this to scale
   * @param _r We use this to compute the translation offset and rotation origin. If _r not provided, we call computesSvgBoxRadius.
   * @returns
   */
  private getVisibleObjectTransformStyle(_r = 0, scale = 1, scaleY = 1) {
    const { angle, anglePhase } = this;

    const r = _r || this.computesSvgBoxRadius();
    const [offsetX, offsetY] = this.computesVisibleObjectOffset(r);

    const deg = angle + anglePhase;

    return `rotate(${deg} ${r} ${r}) translate(${offsetX} ${offsetY}) scale(${scale} ${
      scaleY || scale
    })`;
  }

  getSvgViewboxProp() {
    const r = this.computesSvgBoxRadius();
    return `0 0 ${r * 2} ${r * 2}`;
  }
}

export interface SVGOverlay<S = {}> extends WithLayerState<S> {
  _map: WikMap;
  /**
   * world bounds.
   */
  _bounds: L.LatLngBounds;
  _fromBoundsMark: L.Rectangle;
  _image: HTMLElement;
  dragging: WikDraggable;

  redraw(): void;
}
