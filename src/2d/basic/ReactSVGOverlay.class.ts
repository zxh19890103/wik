import React from 'react';
import L, { Map } from 'leaflet';
import { SVGOverlay } from './SVGOverlay.class';
import { ReactSVGOverlayAppServer } from './ReactSVGOverlayApp';
import type { SvgData, SvgFC, SvgFunctionComponent } from './SVGComponentFactory';
import { leafletOptions } from '../utils';

let _svg_id = 1992;

export type SvgStyleElementType = 'rect' | 'circle';

@leafletOptions<L.ImageOverlayOptions>({})
export class ReactSVGOverlay<D extends SvgData = SvgData, S = {}> extends SVGOverlay<S> {
  private readonly svgC: SvgFC;
  readonly svgServer: ReactSVGOverlayAppServer = null;
  readonly svgId: string;

  svgStyleElement: SvgStyleElementType = 'rect';
  svgStyle: React.SVGAttributes<SVGRectElement> = {};
  svgData: D = {} as D;

  constructor(
    svgC: SvgFC,
    latlng: L.LatLngExpression,
    sizeX: number,
    sizeY: number,
    svgServer: ReactSVGOverlayAppServer,
    options?: L.ImageOverlayOptions,
  ) {
    super(null, latlng, sizeX, sizeY, options);
    this.svgC = svgC;
    this.svgId = `wik-reactsvg-id_${_svg_id++}`;
    this.svgServer = svgServer;
  }

  leafletRender() {
    super.leafletRender();
    this.reqSvgUpdate();
  }

  private reqSvgUpdate() {
    if (this._isRenderScheduled) return;

    svgUpdateReqs.add(this);
    if (svgUpdateTaskScheduled) return;
    // it looks like that queueMicroTask do not work well.
    setTimeout(flushSvgUpdateReqs);
    svgUpdateTaskScheduled = true;
  }

  /**
   * @private
   */
  _doUpdateSVG() {
    if (!this._map || !this._image) return;
    if (!this.svgServer || !this.svgServer.isMounted) return;
    this.svgServer.updateComponent(this.svgId, this.svgData, this.svgStyle);
  }

  setSVGData(nextData: Partial<D> = null) {
    this.svgData = {
      ...this.svgData,
      ...nextData,
    };

    this.reqSvgUpdate();
  }

  setSVGStyle(style: React.SVGAttributes<SVGRectElement>) {
    this.svgStyle = { ...this.svgStyle, ...style };
    this.reqSvgUpdate();
  }

  override onAdd(map: Map): this {
    this.svgServer
      .addComponent(this.svgC, this.svgId, this, this.svgData, this.svgStyle)
      .then((svgElement) => {
        this._url = svgElement;
        this._initImage();
        super.onAdd(map);
        // Here we update svg after added because we need to see the lastest state on page at initial.
        // this.reqSvgUpdate(); // not needed for reactive layer would emit a init render request after added.
        this.onMounted && this.onMounted();
      })
      .catch((err) => {
        console.log(err);
      });

    return this;
  }

  override onRemove(map: Map): this {
    // delete by react firstly, and then try deleting by leaflet, thus no error would emit.
    this.svgServer.removeComponent(this.svgId);
    super.onRemove(map);
    return this;
  }
}

export interface ReactSVGOverlay<D extends SvgData = SvgData, S = {}> {
  _url: HTMLElement;
  _initImage: () => void;
  /**
   * Layer 添加到 map 上之后回调，注意其与 onAdd 的不同
   */
  onMounted(): void;
}

//#region updates

let svgUpdateTaskScheduled = false;
const svgUpdateReqs: Set<ReactSVGOverlay> = new Set();

function flushSvgUpdateReqs() {
  for (const update of svgUpdateReqs) {
    update._doUpdateSVG();
  }

  svgUpdateReqs.clear();
  svgUpdateTaskScheduled = false;
}

//#endregion
