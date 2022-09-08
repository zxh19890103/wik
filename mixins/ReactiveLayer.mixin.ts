import L from 'leaflet';
import * as glMatrix from 'gl-matrix';
import { Constructor } from '../interfaces/Constructor';
import { ReactiveLayerRenderEffect } from './effects';
import { appendLayerRenderReq } from './reactiveLayerRenderThread';
import { AnyObject, PolylineLatLngs } from '../interfaces/types';
import symbols from './is';
import { mapLatLng } from '../utils/mapLatLng';
import { boundToLatLngs } from '../utils/boundToLatLngs';
import { ReactiveLayer } from './ReactiveLayer';
import { uniqueLayerId } from '../interfaces/WithLayerID';
import { IList } from '../model';

const { mat3, vec2 } = glMatrix;
const D2R = 180 / Math.PI;

export function ReactiveLayerMixin(
  Base: Constructor<L.Layer>,
): Constructor<L.Layer & ReactiveLayer>;
export function ReactiveLayerMixin(Base: Constructor<L.Path>): Constructor<L.Path & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.Polyline>,
): Constructor<L.Polyline & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.Polygon>,
): Constructor<L.Polygon & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.Rectangle>,
): Constructor<L.Rectangle & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.Circle>,
): Constructor<L.Circle & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.CircleMarker>,
): Constructor<L.CircleMarker & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.Marker>,
): Constructor<L.Marker & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.SVGOverlay>,
): Constructor<L.SVGOverlay & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.ImageOverlay>,
): Constructor<L.ImageOverlay & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.DivOverlay>,
): Constructor<L.DivOverlay & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.VideoOverlay>,
): Constructor<L.VideoOverlay & ReactiveLayer>;
export function ReactiveLayerMixin(
  Base: Constructor<L.Layer>,
): Constructor<L.Layer & ReactiveLayer> {
  return class extends Base implements ReactiveLayer {
    readonly $$isReactive = symbols.isReactiveSymbol;

    $$list: IList<ReactiveLayer> = null;
    $$parent: ReactiveLayer = null;
    $$children: ReactiveLayer[] = [];

    layerId = uniqueLayerId();
    latlngs: PolylineLatLngs = [];
    angle = 0;
    position: L.LatLng = new L.LatLng(0, 0);
    scale: L.Point = new L.Point(1, 1);

    layerState: AnyObject = {};

    private lastSnapshot = null;
    ifRender = true;

    isObjClickEventCancelled = false;
    cancelObjClickEvent() {
      this.isObjClickEventCancelled = true;
      requestAnimationFrame(() => {
        this.isObjClickEventCancelled = false;
      });
    }

    getSnapshot() {
      return this.lastSnapshot;
    }

    snapshot(): void {
      this.lastSnapshot = this.toSnapshot();
    }

    toSnapshot() {
      return {
        id: this.layerId,
        parent: this.$$parent.layerId,
        angle: this.angle,
        position: this.position.clone(),
        scale: this.scale,
        latlngs: JSON.parse(JSON.stringify(this.latlngs)),
        state: { ...this.layerState },
      };
    }

    override onAdd(map: L.Map): this {
      super.onAdd(map);
      this.requestRenderCall(ReactiveLayerRenderEffect.init);
      return this;
    }

    override remove(): this {
      if (this.$$list) {
        this.$$list.remove(this);
      } else {
        super.remove();
      }
      return this;
    }

    addChild(...children: ReactiveLayer[]): void {
      throw new Error('Method not implemented.');
    }

    removeChild(...children: ReactiveLayer[]): void {
      throw new Error('Method not implemented.');
    }

    traverse(every: (item: ReactiveLayer) => void): void {
      throw new Error('Method not implemented.');
    }

    isChild(): boolean {
      return !!this.$$parent;
    }

    setLayerState(partial: AnyObject): void {
      const state = this.layerState;
      let diff = false;

      for (const k in partial) {
        if (partial[k] !== state[k]) diff = true;
      }

      if (diff) {
        this.layerState = {
          ...state,
          ...partial,
        };

        this.requestRenderCall(ReactiveLayerRenderEffect.state);
      }
    }

    setPosition(latOrLatLng: number | L.LatLngExpression, lng?: number): void {
      if (typeof latOrLatLng === 'object') {
        this.position = L.latLng(latOrLatLng);
      } else {
        this.position = new L.LatLng(latOrLatLng, lng);
      }

      this.isMatrixNeedsUpdate = true;
      this.requestRenderCall(ReactiveLayerRenderEffect.translate);
    }

    setLat(lat: number): void {
      const { lng } = this.position;
      this.setPosition(lat, lng);
    }

    setLng(lng: number): void {
      const { lat } = this.position;
      this.setPosition(lat, lng);
    }

    setAngle(deg: number): void {
      this.angle = deg;
      this.isMatrixNeedsUpdate = true;
      this.requestRenderCall(ReactiveLayerRenderEffect.rotate);
    }

    setScale(sOnLat: number, sOnLng?: number): void {
      this.scale = new L.Point(sOnLat, sOnLng === undefined ? sOnLat : sOnLng);
      this.isMatrixNeedsUpdate = true;
      this.requestRenderCall(ReactiveLayerRenderEffect.scale);
    }

    setLocalLatLngs(latlngs: PolylineLatLngs): void {
      this.latlngs = latlngs;
      this.isMatrixNeedsUpdate = true;
      this.requestRenderCall(ReactiveLayerRenderEffect.shape);
    }

    setLocalBounds(latlngBounds: L.LatLngBoundsExpression): void {
      if ((this as any)._boundsToLatLngs === undefined) return;
      const latlngs = boundToLatLngs(latlngBounds);
      this.setLocalLatLngs([latlngs]);
    }

    translate(dLat: number, dLng: number): void {
      const { lat, lng } = this.position;
      this.setPosition(lat + dLat, lng + dLng);
    }

    translateLat(dLat: number): void {
      const { lat, lng } = this.position;
      this.setPosition(lat + dLat, lng);
    }

    translateLng(dLng: number): void {
      const { lat, lng } = this.position;
      this.setPosition(lat, lng + dLng);
    }

    rotate(dDeg: number): void {
      this.setAngle(this.angle + dDeg);
    }

    scales(dLat: number, dLng = 1) {
      const { x, y } = this.scale;
      this.setScale(x * dLat, y * dLng);
    }

    requestRenderCall(effect: ReactiveLayerRenderEffect) {
      if (!this.ifRender) {
        this.ifRender = true;
        return;
      }

      appendLayerRenderReq(this, effect);

      this.updateMatrix();
      for (const child of this.$$children) {
        child.requestRenderCall(ReactiveLayerRenderEffect.child);
      }
    }

    //#region matrix

    matrix: glMatrix.mat3 = null;
    worldMatrix: glMatrix.mat3 = null;
    worldMatrixInvert: glMatrix.mat3 = null;
    isMatrixNeedsUpdate = true;

    /**
     * 计算的逻辑：
     * @see https://zbqq3ri6o0.feishu.cn/docs/doccnapGd3Ldm2TCvOWLe1fQdLe#d3LEuM
     */
    updateMatrix() {
      if (!this.isMatrixNeedsUpdate) return;
      this.matrix = mat3.create();

      const { position, angle, scale } = this;

      const translation = mat3.fromTranslation(mat3.create(), [position.lng, position.lat]);
      const rotation = mat3.fromRotation(mat3.create(), angle * D2R);
      const scaling = mat3.fromScaling(mat3.create(), [scale.y, scale.x]);

      mat3.multiply(this.matrix, this.matrix, translation);
      mat3.multiply(this.matrix, this.matrix, rotation);
      mat3.multiply(this.matrix, this.matrix, scaling);

      this.updateWorldMatrix();

      this.isMatrixNeedsUpdate = false;
    }

    updateWorldMatrix() {
      const parent = this.$$parent;

      if (parent) {
        // if parent world matrix is null ?
        if (parent.worldMatrix === null) {
          parent.updateMatrix();
          return;
        }

        if (this.matrix === null) {
          this.updateMatrix();
          return;
        }

        this.worldMatrix = mat3.create();
        mat3.multiply(this.worldMatrix, parent.worldMatrix, this.matrix);
      } else {
        this.worldMatrix = mat3.clone(this.matrix);
      }

      this.worldMatrixInvert = mat3.create();
      mat3.invert(this.worldMatrixInvert, this.worldMatrix);

      if (this.$$children) {
        for (const child of this.$$children) {
          child.updateWorldMatrix();
        }
      }
    }

    localToWorld(latlngExpr: L.LatLngExpression): L.LatLng {
      const latlng = L.latLng(latlngExpr);
      const input = [latlng.lng, latlng.lat] as glMatrix.ReadonlyVec2;
      const output: glMatrix.vec2 = [0, 0];
      vec2.transformMat3(output, input, this.worldMatrix);
      const worldLatLng: L.LatLng = new L.LatLng(output[1], output[0]);
      return worldLatLng;
    }

    worldToLocal(latlngExpr: L.LatLngExpression): L.LatLng {
      const latlngObj = L.latLng(latlngExpr);
      const output = [0, 0] as glMatrix.vec2;
      const input = [latlngObj.lng, latlngObj.lat] as glMatrix.vec2;
      vec2.transformMat3(output, input, this.worldMatrixInvert);
      return new L.LatLng(output[1], output[0], latlngObj.alt);
    }

    //#endregion

    //#region default OnXXX
    onTransform(snapshot: any): void {
      if (this instanceof L.Polyline) {
        this.setLatLngs(
          mapLatLng(
            this.latlngs,
            (latlng, _latlng) => {
              return this.localToWorld(latlng);
            },
            (this as any)._latlngs,
          ),
        );
      } else if (this instanceof L.Circle || this instanceof L.Marker) {
        this.setLatLng(this.localToWorld([0, 0]));
      } else {
        console.log('not Polyline Or Circle, no need to transform');
      }
    }
    //#endregion
  };
}
