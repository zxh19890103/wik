import * as glMatrix from 'gl-matrix';
import { ReactiveLayerRenderEffect } from './effects';
import { WithClickCancel } from '../model/basic/ClickCancel';
import { IList } from '@/model';
import {
  WithParent,
  WithRef,
  PolylineLatLngs,
  WithLayerID,
  InteractiveExports,
} from '@/interfaces';
import { WithSnapshotAbstract } from '../model/basic/Snapshot';

export interface ReactiveLayerSnapshot<S = any> {
  id: string;
  parent: string;
  angle: number;
  position: L.LatLng;
  scale: L.LatLngLiteral;
  latlngs: PolylineLatLngs;
  state: S;
}

export type ReactiveLayerRenderingMode = 'mixed' | 'vector' | 'overlay' | 'marker';

export interface ReactiveLayer<S = any>
  extends WithSnapshotAbstract<ReactiveLayerSnapshot<S>>,
    WithClickCancel,
    WithLayerID,
    WithParent<IList<ReactiveLayer>>,
    InteractiveExports,
    WithRef {
  readonly renderingMode: ReactiveLayerRenderingMode;

  readonly $$isReactive: true;

  /**
   * If you want to disable matrix transformation.
   *
   * which means it is an object exsiting in the root system without any sub-system.
   */
  readonly disableMatrix: boolean;

  _lastRenderedEffect: ReactiveLayerRenderEffect;
  _isRenderScheduled: boolean;

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
  traverse<T extends ReactiveLayer = ReactiveLayer>(every: (item: T) => void): void;

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

  leafletRender(): void;

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
  /**
   * state
   */
  onLayerStateUpdate?(previousState: unknown): void;
  /**
   * All render cases, transform & state.
   */
  onRender?(effect: ReactiveLayerRenderEffect): void;
  /**
   * called after leaflet rendered.
   */
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
