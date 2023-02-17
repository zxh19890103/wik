import L from 'leaflet';
import { LayerWithID } from '@/interfaces';
import { util$$, inject, interfaces } from '@/model';
import { LayerList } from './LayerList.class';
import { WikMap } from './Map.class';
import { PaneManager, WikPane, WikPaneType } from '../state/PaneManager.class';

export class VectorLayerList<M extends LayerWithID, E extends string = never> extends LayerList<
  M,
  E
> {
  @inject(interfaces.IPaneManager)
  readonly paneMgr: PaneManager;

  readonly pane: string;
  readonly rendererType: WikPaneType;
  readonly paneObj: WikPane = null;

  constructor(pane: string, rendererType: WikPaneType) {
    super([]);
    this.rendererType = rendererType;
    if (!__PROD__) {
      if (rendererType === 'overlay') {
        throw new Error(`${rendererType} is not allowed!`);
      }
    }
    this.pane = pane;
  }

  protected override _add(item: M): void {
    L.Util.setOptions(item, { renderer: this.paneObj.renderer });
    super._add(item);
  }

  override setZ(z: number) {
    if (!__PROD__ && z > 499) {
      console.error('z should not be greater than 500');
      return;
    }

    this.paneMgr.setOrder(this.pane, z);
  }

  override mount(parent: WikMap): void {
    super.mount(parent);
    const paneObj = this.paneMgr.get(this.pane, this.rendererType, _pane_z_seed++);
    util$$.writeReadonlyProp(this, 'paneObj', paneObj);
  }
}

let _pane_z_seed = 402;
