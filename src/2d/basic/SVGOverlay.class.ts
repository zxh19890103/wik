import L from 'leaflet';
import { WikDraggable } from './Draggable.class';
import { WikMap } from './Map.class';
import { empty_bounds } from './constants';
import { leafletOptions } from '../utils';
import { mix, alias } from '@/model';
import { ReactiveLayer, ReactiveLayerMixin, ReactiveLayerRenderEffect } from '@/mixins';
import { WithLayerState } from '@/interfaces';

@leafletOptions<L.ImageOverlayOptions>({
  interactive: true,
  bubblingMouseEvents: false,
})
@alias('_reset', 'redraw')
export class SVGOverlay<S = {}> extends mix(L.SVGOverlay).with<L.SVGOverlay, ReactiveLayer>(
  ReactiveLayerMixin,
) {
  private _size: L.Point = null;
  /**
   * 修改前的 svg 尺寸
   */
  __preSize: L.Point = null;

  get size(): L.Point {
    return this._size;
  }

  // eslint-disable-next-line
  set size(val: L.PointExpression) {
    this.__preSize = this._size;
    this._size = L.point(val);
  }

  /**
   * svg 的短边
   */
  get svgMinLength() {
    return Math.min(this._size.x, this._size.y);
  }

  constructor(
    el: string | SVGElement,
    position: L.LatLngExpression,
    sizeX: number,
    sizeY: number,
    options?: L.ImageOverlayOptions,
  ) {
    super(el, empty_bounds, options);
    // (this as any)._initContextMenu();
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

  computesSvgBoxRadius() {
    const { x, y } = this._size;
    const hx = x / 2;
    const hy = y / 2;
    const r = Math.sqrt(hx * hx + hy * hy);
    return r;
  }

  /**
   * includes：viewbox/style/root G transform
   * @param scale means
   * @returns
   */
  getSVGLayout(scale = 1) {
    const r = this.computesSvgBoxRadius();
    const size = r * 2;

    const gAttrs = {
      transform: this.getVisibleObjectTransformStyle(scale, r),
    };

    const styleAttrs = {
      x: 0,
      y: 0,
      width: size,
      height: size,
      cx: r,
      cy: r,
      r: r,
      fill: 'none',
      stroke: 'none',
    };

    return {
      gAttrs,
      styleAttrs,
      viewbox: `0,0,${size},${size}`,
    };
  }

  /**
   * svg 内可见物体（角度为 0 的时候）的位置
   * @param r 为 svg 的窗口尺寸
   */
  computesVisibleObjectOffset(boxRadius: number) {
    const { x, y } = this._size;
    return [boxRadius - x / 2, boxRadius - y / 2];
  }

  onRender() {
    const r = this.computesSvgBoxRadius();
    const { lat, lng } = this.position;
    this._bounds = new L.LatLngBounds([-r + lat, -r + lng], [r + lat, r + lng]);
    if (!this._image || !this._map) return;
    this.redraw();
  }

  // getCenter() {
  //   return this._bounds.getCenter();
  // }

  /**
   *
   * @param scale We use this to scale
   * @param _r We use this to compute the translation offset and rotation origin. If _r not provided, we call computesSvgBoxRadius.
   * @returns
   */
  getVisibleObjectTransformStyle(scale = 1, _r = 0) {
    const { angle, anglePhase } = this;

    const r = _r || this.computesSvgBoxRadius();
    const [offsetX, offsetY] = this.computesVisibleObjectOffset(r);

    const deg = angle + anglePhase;

    return `rotate(${deg} ${r} ${r}) translate(${offsetX} ${offsetY}) scale(${scale} ${scale})`;
  }

  getSvgViewboxProp() {
    const r = this.computesSvgBoxRadius();
    return `0 0 ${r * 2} ${r * 2}`;
  }

  override setScale(s: number): void {
    const { x, y } = this.size;
    this.setSize(x * s, y * s);
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
