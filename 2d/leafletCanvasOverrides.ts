import L, { DomEvent } from 'leaflet';
import { IDisposable } from '../interfaces/Disposable';
import { IPaneManager } from '../interfaces/symbols';
import { inject, injectable, writeReadonlyProp } from '../model/basic';
import { HrMap } from './basic';
import { PaneManager } from './state';

// @see https://github.com/Leaflet/Leaflet/blob/main/src/layer/vector/Canvas.js
// overrides
(L.Canvas.prototype as any)._initContainer = function () {
  const container = (this._container = document.createElement('canvas'));

  // These 3 lines are deleted for we will use a proxy pane.
  // DomEvent.on(container, 'mousemove', this._onMouseMove, this);
  // DomEvent.on(container, 'click dblclick mousedown mouseup contextmenu', this._onClick, this);
  // DomEvent.on(container, 'mouseout', this._handleMouseOut, this);

  container['_leaflet_disable_events'] = true; // 1.8

  this._ctx = container.getContext('2d');
};

(L.Canvas.prototype as any)._fireEvent = function (layers, e, type) {
  if (phaseOfMouseEventHandleLoopFrame === 0) {
    // default
    this._map._fireDOMEvent(e, type || e.type, layers);
    return;
  }

  if (layers && phaseOfMouseEventHandleLoopFrame === 1) {
    this._map._fireDOMEvent(e, type || e.type, layers);
    phaseOfMouseEventHandleLoopFrame = 2;
    return;
  }

  if (fireEvtCall === this._map['__canvas_renderers_size__']) {
    this._map._fireDOMEvent(e, type || e.type, layers);
  }
};

/**
 * 0 - no
 * 1 - loop
 * 2 - break
 */
let phaseOfMouseEventHandleLoopFrame = 0;
let fireEvtCall = 0; // on called counter.

@injectable()
@inject(IPaneManager)
export class RenderersManager implements IDisposable {
  private renderers: Map<string, L.Renderer> = new Map();
  private renderersInOrder = [];
  private size = 0; // count of renderer

  readonly map: HrMap;

  constructor(private paneMgr: PaneManager) {}

  add(key: string, renderer: L.Renderer) {
    this.renderers.set(key, renderer);
    this.size += 1;
  }

  private order = () => {
    const panes = this.paneMgr.pool;
    const z = [];
    const zr = {};
    for (const n in panes) {
      if (!this.renderers.has(n)) continue;
      const o = panes[n];
      z.push(o.z);
      zr[o.z] = this.renderers.get(n);
    }

    z.sort((a, b) => b - a);

    this.renderersInOrder = z.map((x) => zr[x]);
  };

  private onMouseMove(e) {
    phaseOfMouseEventHandleLoopFrame = 1;
    fireEvtCall = 0;
    for (const renderer of this.renderersInOrder) {
      fireEvtCall++;
      if (phaseOfMouseEventHandleLoopFrame === 2) continue;
      if (!renderer._map) continue;
      renderer._onMouseMove(e);
    }
    fireEvtCall = 0;
    phaseOfMouseEventHandleLoopFrame = 0;
  }

  private onClick(e) {
    phaseOfMouseEventHandleLoopFrame = 1;
    fireEvtCall = 0;
    for (const renderer of this.renderersInOrder) {
      fireEvtCall++;
      if (phaseOfMouseEventHandleLoopFrame === 2) continue;
      if (!renderer._map) continue;
      renderer._onClick(e);
    }
    fireEvtCall = 0;
    phaseOfMouseEventHandleLoopFrame = 0;
  }

  private onMouseOut(e) {
    phaseOfMouseEventHandleLoopFrame = 1;
    fireEvtCall = 0;
    for (const renderer of this.renderersInOrder) {
      fireEvtCall++;
      if (phaseOfMouseEventHandleLoopFrame === 2) continue;
      if (!renderer._map) continue;
      renderer._handleMouseOut(e);
    }
    fireEvtCall = 0;
    phaseOfMouseEventHandleLoopFrame = 0;
  }

  interactAll() {
    const { paneMgr } = this;
    const { renderer } = paneMgr.get('proxyPane', 'canvas', 499);
    const container = renderer._container;

    writeReadonlyProp(this.map, '__canvas_renderers_size__', this.size);
    paneMgr.onZChange = this.order;
    this.order();

    DomEvent.on(container, 'mousemove', this.onMouseMove, this);
    DomEvent.on(container, 'click dblclick mousedown mouseup contextmenu', this.onClick, this);
    DomEvent.on(container, 'mouseout', this.onMouseOut, this);
  }

  dispose(): void {}
}
