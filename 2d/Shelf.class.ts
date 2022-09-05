import L from 'leaflet';
import { OnHighlight, OnMouseOverOut, OnSelect } from '../interfaces/Interactive';
import { PolylineLatLngs } from '../interfaces/types';
import { WithInput } from '../interfaces/WithInput';
import { WithLayerState } from '../interfaces/WithLayerState';
import { ReactiveLayerRenderEffect } from '../mixins/effects';
import { leafletOptions } from '../utils/leaflet';
import { Polygon } from './basic';
import type { meta } from './meta';

const default_latlngs = [
  [-300, -300],
  [-300, 300],
  [300, 300],
  [300, -300],
] as PolylineLatLngs;

@leafletOptions<L.PolylineOptions>({
  color: '#d9d9d9',
  opacity: 1,
  fillColor: '#f2f2f2',
  fillOpacity: 1,
})
export class Shelf
  extends Polygon
  implements
    WithInput,
    OnSelect<{ color: string }>,
    OnMouseOverOut<{ color: string }>,
    OnHighlight<{ color: string }>
{
  constructor(latlng: L.LatLngExpression, meta?: meta.Shelf) {
    const latlngs = meta ? calcLatlngsByShelfMeta(meta) : default_latlngs;
    super(latlngs, {});
    this.latlngs = latlngs;
    this.position = L.latLng(latlng);
    this.angle = meta?.angle || 0;
  }

  onHighlight(): { color: string } {
    const color = this.options.color;
    this.setStyle({ color: '#f10' });
    return { color };
  }

  onUnHighlight(state?: { color: string }): void {
    this.setStyle(state);
  }

  onHover(): { color: string } {
    const color = this.options.color;
    this.setStyle({ color: '#900' });
    return { color };
  }

  onUnHover(state?: { color: string }): void {
    this.setStyle({ color: state?.color });
  }

  onSelect() {
    const color = this.options.color;
    this.setStyle({ color: '#09f' });
    return { color };
  }

  onUnSelect(state: { color: string }): void {
    this.setStyle({ color: state.color });
  }

  onInitInput?(data: any): void {
    throw new Error('Method not implemented.');
  }

  onInput(data: any): void {
    this.setLayerState({ error: Boolean(data.error) });
  }

  onRender(effect: ReactiveLayerRenderEffect): void {
    if (this.layerState.error) {
      this.setStyle({ color: '#f00' });
    } else {
      this.setStyle({ color: '#0f0' });
    }
  }
}

interface ShelfState {
  error: boolean;
}

export interface Shelf extends WithLayerState<ShelfState> {
  _renderer: L.Canvas;
  _pxBounds: L.Bounds;
}

/**
 * 不能按照这样的方式计算，
 * 因为存在很大误差；
 *
 * 可能需要回到像素点进行绘制
 *
 * @warn
 */
const calcLatlngsByShelfMeta = (meta: meta.Shelf) => {
  const latlngs: L.LatLngTuple[][] = [];
  const { columns, rows, unitL, unitW, totalL, totalW } = meta;

  if (totalL && totalW) {
    latlngs.push([
      [-totalL / 2, -totalW / 2],
      [-totalL / 2, totalW / 2],
      [totalL / 2, totalW / 2],
      [totalL / 2, -totalW / 2],
    ]);
    return latlngs;
  }

  const gapW = meta.gapW || 0;
  const gapL = meta.gapL || 0;
  const clientW = unitW + 2 * gapW;
  const clientL = unitL + 2 * gapL;
  const tW = clientW * columns;
  const tL = clientL * rows;

  const pilarR = meta.pilarR || 0;

  const corners = [
    [-tL / 2, -tW / 2],
    [-tL / 2, tW / 2],
    [tL / 2, tW / 2],
    [tL / 2, -tW / 2],
  ];

  if (rows === 2) {
    corners.push([0, -tW / 2], [0, tW / 2]);
  }

  const pilarLocalLatLngs = [
    [-pilarR, -pilarR],
    [-pilarR, pilarR],
    [pilarR, pilarR],
    [pilarR, -pilarR],
  ];

  // pilars x4
  for (let i = 0, s = corners.length; i < s; i++) {
    const [tY, tX] = corners[i];
    const pilar = [null, null, null, null];
    latlngs.push(pilar);
    for (let j = 0; j < 4; j++) {
      const localLatLng = pilarLocalLatLngs[j];
      pilar[j] = [localLatLng[0] + tY, localLatLng[1] + tX];
    }
  }

  // containers
  const local = [
    [-unitL / 2, -unitW / 2],
    [-unitL / 2, unitW / 2],
    [unitL / 2, unitW / 2],
    [unitL / 2, -unitW / 2],
  ];

  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < rows; r++) {
      const tX = clientW / 2 + clientW * c - tW / 2;
      const tY = clientL / 2 + clientL * r - tL / 2;
      const unit = [null, null, null, null];
      latlngs.push(unit);

      for (let i = 0; i < 4; i++) {
        const localLatLng = local[i];
        unit[i] = [localLatLng[0] - tY, localLatLng[1] - tX];
      }
    }
  }

  // by this, we got it right.
  latlngs.push(
    [
      [-tL / 2, -tW / 2],
      [-tL / 2, tW / 2],
      [tL / 2, tW / 2],
      [tL / 2, -tW / 2],
    ],
    [
      [-tL / 2, -tW / 2],
      [-tL / 2, tW / 2],
      [tL / 2, tW / 2],
      [tL / 2, -tW / 2],
    ],
  );

  return latlngs;
};
