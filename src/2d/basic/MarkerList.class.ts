import L from 'leaflet';
import { inject, interfaces, util$$ } from '@/model';
import { PaneManager, WikPane } from '../state';
import { LayerList } from './LayerList.class';
import { WikMap } from './Map.class';
import { Marker } from './Marker.class';

export class MarkerList<M extends Marker = Marker, E extends string = never> extends LayerList<
  M,
  E
> {
  readonly pane: string;
  readonly paneObj: WikPane;

  @inject(interfaces.IPaneManager)
  readonly paneMgr: PaneManager;

  constructor(pane: string) {
    super([]);
    this.pane = pane;
  }

  protected override _add(item: M): void {
    L.Util.setOptions(item, { pane: this.paneObj.fullname });
    super._add(item);
  }

  override setZ(z: number) {
    if (!__PROD__ && z < 500) {
      console.error('z should not be less than 500');
      return;
    }

    this.paneMgr.setOrder(this.pane, z);
  }

  override mount(parent: WikMap): void {
    super.mount(parent);
    const paneObj = this.paneMgr.get(this.pane, 'overlay', _pane_z_seed++);
    util$$.writeReadonlyProp(this, 'paneObj', paneObj);
  }
}

let _pane_z_seed = 600;
