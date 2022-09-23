import L from 'leaflet';
import { LayerWithID } from '../../interfaces/WithLayerID';
import { writeReadonlyProp } from '../../model/basic';
import { inject } from '../../model/basic/inject';
import { LayerList } from './LayerList.class';
import { HrMap } from './Map.class';
import { PaneManager, PaneName, PaneObject, RendererType } from '../state/PaneManager.class';
import * as Interface from '../../interfaces/symbols';

let __pane_z_seed = 402;

export class VectorLayerList<M extends LayerWithID, E extends string = never> extends LayerList<
  M,
  E
> {
  @inject(Interface.IPaneManager)
  readonly paneMgr: PaneManager;

  readonly pane: PaneName;
  readonly rendererType: RendererType;

  readonly paneObj: PaneObject = null;

  constructor(pane: PaneName, rendererType: RendererType) {
    super([]);
    this.rendererType = rendererType;
    if (!__PROD__) {
      if (rendererType === 'none') {
        throw new Error(`${rendererType} is not allowed!`);
      }
    }
    this.pane = pane;
  }

  onItemAdd(item: M): void {
    L.Util.setOptions(item, { renderer: this.paneObj.renderer });
    writeReadonlyProp(item, '$$list', this);
  }

  override mount(parent: HrMap): void {
    super.mount(parent);
    const paneObj = this.paneMgr.get(this.pane, this.rendererType, __pane_z_seed++);
    writeReadonlyProp(this, 'paneObj', paneObj);
  }
}
