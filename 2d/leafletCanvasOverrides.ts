import L, { DomEvent } from 'leaflet';
import { PaneManager } from './basic';

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
  if (inMouseEventHandleForFramePhase === 0) {
    // default
    this._map._fireDOMEvent(e, type || e.type, layers);
    return;
  }

  if (layers && inMouseEventHandleForFramePhase === 1) {
    this._map._fireDOMEvent(e, type || e.type, layers);
    inMouseEventHandleForFramePhase = 2;
    return;
  }

  if (fireEvtCall === renderersCount) {
    this._map._fireDOMEvent(e, type || e.type, layers);
  }
};

const __renderers__: Map<string, L.Renderer> = new Map();

export const manageRenderer = (pane: string, renderer: L.Renderer = null) => {
  __renderers__.set(pane, renderer);
  renderersCount += 1;
};

let inMouseEventHandleForFramePhase = 0;
let renderersCount = 0; // count of renderer
let fireEvtCall = 0; // on called counter.
let renderers_in_order = [];

export function interactivateAllPanes(map: L.Map, paneMgr: PaneManager) {
  const { renderer } = paneMgr.get('proxyPane', 'canvas', 499);
  const container = renderer._container;

  // order
  const order = () => {
    const panes = paneMgr.pool;
    const z = [];
    const zr = {};
    for (const n in panes) {
      if (!__renderers__.has(n)) continue;
      const o = panes[n];
      z.push(o.z);
      zr[o.z] = __renderers__.get(n);
    }

    z.sort((a, b) => b - a);

    renderers_in_order = z.map((x) => zr[x]);
  };

  paneMgr.onZChange = order;
  order();

  function onMouseMove(e) {
    inMouseEventHandleForFramePhase = 1;
    fireEvtCall = 0;
    for (const renderer of renderers_in_order) {
      fireEvtCall++;
      if (inMouseEventHandleForFramePhase === 2) continue;
      if (!renderer._map) continue;
      renderer._onMouseMove(e);
    }
    fireEvtCall = 0;
    inMouseEventHandleForFramePhase = 0;
  }

  function onClick(e) {
    inMouseEventHandleForFramePhase = 1;
    fireEvtCall = 0;
    for (const renderer of renderers_in_order) {
      fireEvtCall++;
      if (inMouseEventHandleForFramePhase === 2) continue;
      if (!renderer._map) continue;
      renderer._onClick(e);
    }
    fireEvtCall = 0;
    inMouseEventHandleForFramePhase = 0;
  }

  function onMouseOut(e) {
    inMouseEventHandleForFramePhase = 1;
    fireEvtCall = 0;
    for (const renderer of renderers_in_order) {
      fireEvtCall++;
      if (inMouseEventHandleForFramePhase === 2) continue;
      if (!renderer._map) continue;
      renderer._handleMouseOut(e);
    }
    fireEvtCall = 0;
    inMouseEventHandleForFramePhase = 0;
  }

  DomEvent.on(container, 'mousemove', onMouseMove);
  DomEvent.on(container, 'click dblclick mousedown mouseup contextmenu', onClick);
  DomEvent.on(container, 'mouseout', onMouseOut);
}
