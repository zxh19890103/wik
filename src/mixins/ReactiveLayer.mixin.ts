import L from 'leaflet';
import * as glMatrix from 'gl-matrix';
import { Constructor, WithLayerState } from '@/interfaces';
import { ReactiveLayerRenderEffect } from './effects';
import {
  appendLayerRenderReq,
  reactiveLayerRenderFn,
  reactiveLayerReRenderFn,
} from './_reactive_layer_render_loop';
import { PolylineLatLngs } from '@/interfaces';
import { mapLatLng } from '@/2d/utils/mapLatLng';
import { boundToLatLngs } from '@/2d/utils/boundToLatLngs';
import { ReactiveLayer, ReactiveLayerRenderingMode, ReactiveLayerSnapshot } from './ReactiveLayer';
import { IList } from '@/model/basic/IList';

const { mat3, vec2 } = glMatrix;
const d2r = Math.PI / 180;

let idseed = 2022;

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
  class CCP extends Base implements ReactiveLayer, WithLayerState<any> {
    readonly renderingMode: ReactiveLayerRenderingMode = 'vector';
    readonly $$isReactive = true;

    $$parent: IList<ReactiveLayer> = null;
    $$system: ReactiveLayer = null;
    $$subSystems: ReactiveLayer[] = [];
    $$ref = null;

    readonly disableMatrix = false;
    ifRender = true;

    _lastRenderedEffect: ReactiveLayerRenderEffect = null;
    _isRenderScheduled = false;

    //#region interactive

    _headStateHasChanged = false;
    _uiStateChangeLogs: any[] = null;
    _immediatelyRenderOnce = false;

    //#endregion

    layerId = `layer${idseed++}`;
    latlngs: PolylineLatLngs = [];
    angle = 0;
    anglePhase = 0;
    position: L.LatLng = new L.LatLng(0, 0);
    scale: L.LatLngLiteral = { lat: 1, lng: 1 };

    layerState: any = {};

    isClickEventFireCancelled = false;
    cancelClickEventFire() {
      this.isClickEventFireCancelled = true;
      requestAnimationFrame(() => {
        this.isClickEventFireCancelled = false;
      });
    }

    toSnapshot(): ReactiveLayerSnapshot {
      return {
        id: this.layerId,
        parent: this.$$system.layerId,
        angle: this.angle,
        position: this.position.clone(),
        scale: L.LatLng.prototype.clone.call(this.scale),
        latlngs: JSON.parse(JSON.stringify(this.latlngs)),
        state: { ...this.layerState },
      };
    }

    override onAdd(map: L.Map): this {
      for (const child of this.$$subSystems) {
        this.mountChild(map, child);
      }

      if (super.onAdd) {
        super.onAdd(map);
      }

      this.requestRenderCall(ReactiveLayerRenderEffect.init);
      return this;
    }

    override onRemove(map: L.Map): this {
      // remove
      for (const child of this.$$subSystems) {
        map.removeLayer(child as unknown as L.Layer);
      }

      // remove self.
      if (super.onRemove) {
        super.onRemove(map);
      }

      return this;
    }

    override remove(): this {
      // If it is in a IList
      if (this.$$parent) {
        this.$$parent.remove(this);
        return this;
      }

      // If it's in a system.
      if (this.$$system) {
        this.$$system.removeChild(this);
        return this;
      }

      super.remove();
      return this;
    }

    addChild(...children: ReactiveLayer[]): void {
      if (children.length === 0) return;

      for (const child of children) {
        if (!__PROD__ && child.$$parent) {
          throw new Error('If the child is in a IList, then it should not be under a system.');
        }

        if (child.$$system === this) continue;

        // remove from the origin system.
        if (child.$$system) {
          child.$$system.removeChild(child);
        }

        // add to new one.
        this.$$subSystems.push(child);
        child.$$system = this;
        child.isMatrixNeedsUpdate = true;

        // Of course it is a layer, so we add it to map if this is added.
        const root = this._map || this._mapToAdd;
        if (root) {
          this.mountChild(root, child);
        }

        // parent should be set after child added.
        (child as unknown as L.Layer).addEventParent(this);
      }
    }

    removeChild(...children: ReactiveLayer[]): void {
      if (children.length === 0) return;

      for (const child of children) {
        const i = this.$$subSystems.indexOf(child);
        if (i === -1) continue;

        this.$$subSystems[i] = null;
        child.$$system = null;
        child.isMatrixNeedsUpdate = true;

        // of course , it is also a layer, So, we remove it from map finally.
        const root = this._map || this._mapToAdd;
        root?.removeLayer(child as unknown as L.Layer);

        (child as unknown as L.Layer).removeEventParent(this);
      }

      this.$$subSystems = this.$$subSystems.filter(Boolean);
    }

    private mountChild(map: L.Map, child: ReactiveLayer) {
      if (this.renderingMode === 'mixed') {
        /**
         * if child is a group, skip.
         */
        if (child.renderingMode !== 'mixed') {
          const { renderer, pane, pane2, pane3 } = (this as any).options as any;
          L.Util.setOptions(child, {
            renderer,
            pane:
              child.renderingMode === 'vector'
                ? pane
                : child.renderingMode === 'marker'
                ? pane2
                : pane3,
          });
        }
      } else {
        /**
         * just inherits the parent's renderer and pane.
         */
        const { renderer, pane } = (this as any).options;
        L.Util.setOptions(child, { renderer, pane });
      }

      // add cuz system already added.
      map.addLayer(child as unknown as L.Layer);
    }

    traverse<T extends ReactiveLayer = ReactiveLayer>(every: (item: T) => void): void {
      for (const child of this.$$subSystems) {
        every(child as unknown as T);
        child.traverse<T>(every);
      }
    }

    isChild(): boolean {
      return !!this.$$system;
    }

    setLayerState(partial: any): void {
      if (!__PROD__ && Object.getPrototypeOf(partial) !== Object.prototype) {
        throw new Error('partial must be a plain object.');
      }

      const state = this.layerState;
      let diff = false;

      // compare firstly
      for (const k in partial) {
        if (partial[k] !== state[k]) {
          diff = true;
          break;
        }
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
      this.scale = { lat: sOnLat, lng: sOnLng === undefined ? sOnLat : sOnLng };
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

    getTheWorld<W extends ReactiveLayer>() {
      let world = this as unknown as W;
      while (world.$$system) {
        world = world.$$system as W;
      }
      return world;
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

    scales(dLat: number, _dLng?: number) {
      const { lat, lng } = this.scale;
      const dLng = _dLng === undefined ? dLat : _dLng;
      this.setScale(lat * dLat, lng * dLng);
    }

    requestRenderCall(effect: ReactiveLayerRenderEffect) {
      if (!this.ifRender) {
        this.ifRender = true;
        return;
      }

      // console.log('[requestRenderCall]', ReactiveLayerRenderEffect[effect]);

      this.updateMatrix();

      if (this._immediatelyRenderOnce) {
        reactiveLayerRenderFn(this, effect);
      } else {
        appendLayerRenderReq(this, effect);
      }

      for (const child of this.$$subSystems) {
        child.requestRenderCall(effect);
      }
    }

    //#region matrix

    matrix: glMatrix.mat3 = null;
    worldMatrix: glMatrix.mat3 = null;
    worldMatrixInvert: glMatrix.mat3 = null;
    isMatrixNeedsUpdate = true;

    /**
     * The compution logic:
     */
    updateMatrix() {
      if (!this.isMatrixNeedsUpdate || this.disableMatrix) return;

      this.matrix = mat3.create();

      const { position, angle, scale } = this;

      const translation = mat3.fromTranslation(mat3.create(), [position.lng, position.lat]);
      const rotation = mat3.fromRotation(mat3.create(), -(angle + this.anglePhase) * d2r);
      const scaling = mat3.fromScaling(mat3.create(), [scale.lng, scale.lat]);

      mat3.multiply(this.matrix, this.matrix, translation);
      mat3.multiply(this.matrix, this.matrix, rotation);
      mat3.multiply(this.matrix, this.matrix, scaling);

      this.updateWorldMatrix();

      this.isMatrixNeedsUpdate = false;
    }

    updateWorldMatrix() {
      const parent = this.$$system;

      // 1. calc this world matrix.
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

      // 2. calculates invert
      this.worldMatrixInvert = mat3.create();
      mat3.invert(this.worldMatrixInvert, this.worldMatrix);

      // 3. calc children's world matrixes.
      if (this.$$subSystems) {
        for (const child of this.$$subSystems) {
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

    //#region render

    leafletRender() {
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
        console.log('neither Polyline nor Circle, no need to transform');
      }
    }

    reRender() {
      reactiveLayerReRenderFn(this);
    }

    //#endregion

    //#region default OnCallback
    //#endregion
  }

  return CCP;
}
