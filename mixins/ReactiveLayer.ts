import * as glMatrix from 'gl-matrix';
import { WithSnapshot } from '../interfaces/WithSnapshot';
import { PolylineLatLngs } from '../interfaces/types';
import { WithLayerID } from '../interfaces/WithLayerID';
import { ReactiveLayerRenderEffect } from './effects';
import { WithClickCancel } from './ClickCancel';
import { IList } from '../model/basic';
import { WithParent } from '../interfaces/WithParent';
import { WithRef } from '../interfaces/WithRef';
import { WithLayerState } from '../interfaces/WithLayerState';

interface ReactiveLayerSnapshot {
  id: string;
  parent: string;
  angle: number;
  position: L.LatLng;
  scale: L.LatLngLiteral;
  latlngs: PolylineLatLngs;
  state: any;
}

export interface ReactiveLayer
  extends WithSnapshot<ReactiveLayerSnapshot>,
    WithClickCancel,
    WithLayerID,
    WithLayerState<unknown>,
    WithParent<IList<ReactiveLayer>>,
    WithRef {
  readonly $$isReactive: symbol;

  /**
   * If you want to disable matrix transformation.
   *
   * which means it is an object exsiting in the root system without any sub-system.
   */
  readonly disableMatrix: boolean;

  /**
   * container object
   */
  $$parent: IList<ReactiveLayer>;
  /**
   * reactive layer in which this layer is.
   */
  $$system: ReactiveLayer;
  /**
   * systems which are all in this.
   */
  $$subSystems: ReactiveLayer[];

  /**
   * 图形的顶点坐标
   */
  latlngs: PolylineLatLngs;
  /**
   * 控制图形的旋转角度
   */
  angle: number;
  /**
   * the start angle.
   */
  anglePhase: number;
  /**
   * 控制图形的位置
   */
  position: L.LatLng;
  /**
   * 控制图形的缩放
   */
  scale: L.LatLngLiteral;

  addChild(...children: ReactiveLayer[]): void;
  removeChild(...children: ReactiveLayer[]): void;
  isChild(): boolean;
  traverse<T = ReactiveLayer>(every: (item: T) => void): void;

  setPosition(latlng: L.LatLngExpression): void;
  setPosition(lat: number, lng: number): void;
  setLat(lat: number): void;
  setLng(lng: number): void;
  setAngle(deg: number): void;
  setScale(s: number): void;
  setScale(sOnLat: number, sOnLng: number): void;
  setLocalLatLngs(latlngs: PolylineLatLngs): void;
  setLocalBounds(latlngBounds: L.LatLngBoundsExpression): void;

  translate(dLat: number, dLng: number): void;
  translateLat(dLat: number): void;
  translateLng(dLng: number): void;
  rotate(dDeg: number): void;
  scales(dLat: number): void;
  scales(dLat: number, dLng: number): void;

  // optionals, May be implemented in the specific classes
  onInit?(): void;
  /**
   * any of position/angle/scale/shape/size changes
   */
  onTransform?(snapshot: any): void;
  /**
   * latlngs changes
   */
  onShapeUpdate?(previousLatlngs: PolylineLatLngs): void;
  /**
   * angle changes
   */
  onRotate?(previousAngle: number): void;
  /**
   * position changes
   */
  onTranslate?(previousPosition: L.LatLng): void;
  /**
   * scale changes
   */
  onScale?(previousScale: L.LatLngLiteral): void;
  onLayerUpdate?(snapshot: any): void;
  onLayerStateUpdate?(previousState: unknown): void;
  onRender?(effect: ReactiveLayerRenderEffect): void;
  afterRender?(effect: ReactiveLayerRenderEffect): void;

  // martix
  worldMatrix: glMatrix.mat3;
  isMatrixNeedsUpdate: boolean;
  updateMatrix(): void;
  updateWorldMatrix(): void;
  localToWorld(latlng: L.LatLngExpression): L.LatLng;
  worldToLocal(latlngExpr: L.LatLngExpression): L.LatLng;

  /**
   * IF you want trigger render after this set call, set IfRender TRUE.
   *
   * !Warn: ifRender will be reset to FALSE after rendered;
   */
  ifRender: boolean;
  requestRenderCall(effect: ReactiveLayerRenderEffect): void;
}
