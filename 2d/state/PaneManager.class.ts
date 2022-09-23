import L from 'leaflet';
import { IDisposable } from '../../interfaces/Disposable';
import { injectable } from '../../model/basic/inject';
import { BUILTIN_LEAFLET_PANES } from '../basic/constants';
import { HrMap } from '../basic/Map.class';

/**
 * default z-index of built-in panes:
 *
 * 1. tile 200
 * 2. shadow 500
 * 3. overlay 400
 * ---- custom panes.
 * 4. marker 600
 * 5. tooltip 650
 * 6. popup 700
 */

export type RendererType = 'svg' | 'canvas' | 'none';
export type PaneName = `${string}Pane`;
export interface PaneObject {
  rendererType: RendererType;
  shortName: string;
  name: PaneName;
  renderer?: L.SVG | L.Canvas;
  element: HTMLDivElement;
  z: number;
  visible: boolean;
}

@injectable()
export class PaneManager implements IDisposable {
  readonly map: HrMap;
  private panesElement: HTMLDivElement;
  public readonly pool: Record<string, PaneObject> = {};
  private styleElement: HTMLStyleElement = null;
  public onZChange: VoidFunction = null;

  /**
   *
   * @param pane ends with 'Pane'
   * @param rendererType is canvas OR svg OR without.?
   * @returns
   */
  get(name: PaneName, type: RendererType = 'none', z = 401) {
    if (this.pool[name]) {
      const po = this.pool[name];
      if (type !== 'none' && po.rendererType === 'none') {
        po.renderer = this.createRenderer(name, type, null);
      }
      return po;
    }

    const po = this.create(name, type, z, null);
    this.pool[name] = po;
    this.requestRender();
    return po;
  }

  setZ(name: PaneName, z: number) {
    if (!__PROD__) {
      if (z < 401 || z > 599) {
        throw new Error('z index should be in range of (400, 600)');
      }
    }

    const pane = this.pool[name];
    if (!pane) return;
    pane.z = z;
    this.onZChange && this.onZChange();
    this.requestRender();
  }

  setVisible(name: PaneName, visible: boolean) {
    const pane = this.pool[name];
    if (!pane) return;
    pane.visible = visible;
    this.requestRender();
  }

  private _scheduled = false;
  requestRender() {
    if (this._scheduled) return;

    queueMicrotask(() => {
      this.renderStyle();
      this._scheduled = false;
    });

    this._scheduled = true;
  }

  renderStyle() {
    const style = this.styleElement || document.createElement('style');

    style.innerHTML = Object.entries(this.pool)
      .map(([_, state]) => {
        return ` .leaflet-pane.leaflet-${state.shortName}-pane {
        z-index: ${state.z} !important; 
        display: ${state.visible ? 'block' : 'none'}
      }`;
      })
      .join('\n');

    document.head.appendChild(style);

    this.styleElement = style;
  }

  private create(
    name: PaneName,
    rendererType: RendererType,
    z: number,
    rendererOptions?: L.RendererOptions,
  ): PaneObject {
    const shortName = name.slice(0, name.length - 4);
    const className = `.leaflet-pane.leaflet-${shortName}-pane`;

    if (!this.panesElement) {
      this.panesElement = this.map._container;
    }

    let element: HTMLDivElement = null;

    if (BUILTIN_LEAFLET_PANES.indexOf(name) > -1) {
      element = this.panesElement.querySelector(className);
    } else {
      element = this.map.createPane(name) as HTMLDivElement;
    }

    const renderer = this.createRenderer(name, rendererType, rendererOptions);

    return {
      name,
      shortName,
      element,
      rendererType,
      renderer,
      z,
      visible: true,
    };
  }

  private createRenderer(
    name: PaneName,
    rendererType: RendererType,
    rendererOptions?: L.RendererOptions,
  ) {
    if (rendererType === 'none' || name === 'overlayPane') {
      // The default one
      return (this.map as any)._renderer;
    } else if (rendererType === 'canvas') {
      return L.canvas({ ...rendererOptions, pane: name }).addTo(this.map);
    } else if (rendererType === 'svg') {
      return L.svg({ ...rendererOptions, pane: name }).addTo(this.map);
    }
  }

  delete(pane: PaneName | PaneObject) {
    throw new Error('not implemented');
  }

  dispose(): void {
    document.head.removeChild(this.styleElement);
  }
}
