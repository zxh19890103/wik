import L from 'leaflet';
import { ReactiveLayer } from '../../mixins/ReactiveLayer';
import {
  OnSelect,
  OnInteractName,
  OnMouseOverOut,
  OnClick,
  Interactive,
} from '../../interfaces/Interactive';
import { WithLayerID } from '../../interfaces/WithLayerID';
import { inject, mix, writeReadonlyProp } from '../../model/basic';
import { ReactiveLayerMixin } from '../../mixins/ReactiveLayer.mixin';
import { PaneManager, PaneName, PaneObject } from '../state';
import { IModeManager, IPaneManager, IRendererManager } from '../../interfaces/symbols';
import { leafletOptions } from '../../utils';
import { RenderersManager } from '../leafletCanvasOverrides';
import { ModeManager } from '../../model/modes';

const leafletEvent2OnCallback = {
  click: 'onClick',
  dblclick: 'onDblClick',
  mouseover: 'onHover',
  mouseout: 'onUnHover',
  contextmenu: 'onContextMenu',
  mousedown: 'onPress',
};

interface GroupOptions {
  /**
   * @default group
   */
  pane?: PaneName;
}

@leafletOptions<GroupOptions>({
  pane: 'groupPane',
})
export class Group extends mix(L.Layer).with<L.Layer, ReactiveLayer>(ReactiveLayerMixin) {
  @inject(IPaneManager)
  readonly paneMgr: PaneManager;
  @inject(IRendererManager)
  readonly rendererMgr: RenderersManager;
  @inject(IModeManager)
  readonly modeMgr: ModeManager;

  readonly paneObj: PaneObject;
  readonly options: GroupOptions;

  constructor(layers: ReactiveLayer[] = [], options?: GroupOptions) {
    super();
    this.addChild(...layers);
    L.Util.setOptions(this, options);

    this.on('click dblclick mousedown mouseover mouseout contextmenu', (evt) => {
      L.DomEvent.stop(evt);
      const onCb = leafletEvent2OnCallback[evt.type];
      this.broadcastEventCallback(evt.type);
      this.modeMgr.apply(onCb, this);
    });
  }

  override onAdd(map: L.Map): this {
    const paneObj = this.paneMgr.get(this.options.pane, 'canvas', __pane_z_seed++);
    L.Util.setOptions(this, { renderer: paneObj.renderer });
    writeReadonlyProp(this, 'paneObj', paneObj);
    this.rendererMgr.add(paneObj.name, paneObj.renderer);
    super.onAdd(map);
    return this;
  }

  protected broadcastEventCallback(type: string) {
    const onCb = leafletEvent2OnCallback[type];
    for (const child of this.$$subSystems) {
      child[onCb] && child[onCb]();
    }
  }
}

let __pane_z_seed = 451;
