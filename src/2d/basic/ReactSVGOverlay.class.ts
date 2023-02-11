import React from 'react';
import L, { Map } from 'leaflet';
import { SVGOverlay } from './SVGOverlay.class';
import { ReactSVGOverlayAppServer } from './ReactSVGOverlayApp';
import type { SvgFunctionComponent } from './SVGComponentFactory';
import { leafletOptions } from '@/utils/leaflet';
import { SimpleObject } from '@/interfaces/types';

let _svg_id = 1992;

export type SvgStyleElementType = 'rect' | 'circle';

@leafletOptions<L.ImageOverlayOptions>({})
export class ReactSVGOverlay<D = any> extends SVGOverlay {
  readonly svgServer: ReactSVGOverlayAppServer = null;
  readonly svgC: SvgFunctionComponent;
  readonly svgId: string;

  svgStyleElement: SvgStyleElementType = 'rect';
  svgStyle: React.SVGAttributes<SVGRectElement> = {};
  svgData: D = null;

  private lastSvgStyle: React.SVGAttributes<SVGRectElement> = null;

  constructor(
    svgC: SvgFunctionComponent,
    svgServer: ReactSVGOverlayAppServer,
    sizeX: number,
    sizeY: number,
    options?: L.ImageOverlayOptions,
  ) {
    super(null, [0, 0], sizeX, sizeY, options);
    this.svgC = svgC;
    this.svgId = `hrReactSvgId_${_svg_id++}`;
    this.svgServer = svgServer;
    if (svgServer) {
      L.Util.setOptions(this, { pane: svgServer.pane });
    }
  }

  getLastSvgStyle() {
    return this.lastSvgStyle;
  }

  onRender() {
    super.onRender();
    this.setSVGData();
  }

  updateSVG() {
    svgUpdateReqs.add(this);
    if (svgUpdateTaskScheduled) return;
    // it looks like that queueMicroTask do not work well.
    setTimeout(flushSvgUpdateReqs);
    svgUpdateTaskScheduled = true;
  }

  /**
   * @private
   */
  doUpdateSVG() {
    if (!this._map || !this._image) return;
    if (!this.svgServer || !this.svgServer.isMounted) return;
    this.svgServer.updateComponent(this.svgId, this.svgData, this.svgStyle);
  }

  setSVGData(nextData: D = null) {
    this.svgData = {
      ...this.svgData,
      ...nextData,
      angle: this.angle,
      size: [this.size.x, this.size.y],
    };

    this.updateSVG();
  }

  setSVGStyle(style: React.SVGAttributes<SVGRectElement>) {
    this.lastSvgStyle = this.svgStyle;
    this.svgStyle = { ...this.svgStyle, ...style };
    this.updateSVG();
  }

  override onAdd(map: Map): this {
    this.svgServer
      .addComponent(this.svgC, this.svgId, this, this.svgData, this.svgStyle)
      .then((svgElement) => {
        this._url = svgElement;
        this._initImage();
        super.onAdd(map);
        // Here we update svg after added because we need to see the lastest state on page at initial.
        this.updateSVG();
        this.onMounted && this.onMounted();
      });

    return this;
  }

  override onRemove(map: Map): this {
    // delete by react firstly, and then try delete by leaflet, thus no error would emit.
    this.svgServer.removeComponent(this.svgId);
    super.onRemove(map);
    return this;
  }

  onTransform() {}
}

export interface ReactSVGOverlay<D = any> {
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
    update.doUpdateSVG();
  }

  svgUpdateReqs.clear();
  svgUpdateTaskScheduled = false;
}

//#endregion
