import L, { DomEvent } from 'leaflet';
import { PaneManager } from './basic';

(L.Canvas.prototype as any)._initContainer = function () {
  var container = (this._container = document.createElement('canvas'));

  // These 3 lines are deleted for we will use a proxy pane.
  // DomEvent.on(container, 'mousemove', this._onMouseMove, this);
  // DomEvent.on(container, 'click dblclick mousedown mouseup contextmenu', this._onClick, this);
  // DomEvent.on(container, 'mouseout', this._handleMouseOut, this);

  this._ctx = container.getContext('2d');
};

const renderers: Map<string, L.Renderer> = new Map();

export const manageRenderer = (pane: string, renderer: L.Renderer = null) => {
  renderers.set(pane, renderer);
};

export function interactivateAllPanes(map: L.Map, paneMgr: PaneManager) {
  const { renderer } = paneMgr.get('proxyPane', 'canvas', 499);
  const container = renderer._container;

  function onMouseMove(e) {
    for (const [_, renderer] of renderers) {
      if (!renderer._map) continue;
      renderer._onMouseMove(e);
    }
  }

  function onClick(e) {
    for (const [_, renderer] of renderers) {
      if (!renderer._map) continue;
      renderer._onClick(e);
    }
  }

  function onMouseOut(e) {
    for (const [_, renderer] of renderers) {
      if (!renderer._map) continue;
      renderer._handleMouseOut(e);
    }
  }

  DomEvent.on(container, 'mousemove', onMouseMove);
  DomEvent.on(container, 'click dblclick mousedown mouseup contextmenu', onClick);
  DomEvent.on(container, 'mouseout', onMouseOut);
}
