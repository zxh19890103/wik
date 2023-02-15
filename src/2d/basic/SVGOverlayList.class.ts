import L from 'leaflet';
import { LayerWithID } from '@/interfaces';
import { util$$, mix, inject, interfaces } from '@/model';
import { LayerList } from './LayerList.class';
import { WikMap } from './Map.class';
import { PaneManager, PaneName } from '../state/PaneManager.class';
import { ReactSVGOverlayAppServer } from './ReactSVGOverlayApp';

export class SVGOverlayList<M extends LayerWithID, E extends string = never> extends LayerList<
  M,
  E
> {
  readonly pane: PaneName;
  readonly svgServer: ReactSVGOverlayAppServer;

  @inject(interfaces.IPaneManager)
  readonly paneMgr: PaneManager;

  constructor(pane: PaneName) {
    super([]);
    this.svgServer = new ReactSVGOverlayAppServer();
    this.pane = pane;
  }

  protected override _add(item: M): void {
    L.Util.setOptions(item, { pane: this.pane });
    util$$.writeReadonlyProp(item, 'svgServer', this.svgServer);

    super._add(item);
  }

  override setZ(z: number) {
    if (!__PROD__ && z < 500) {
      console.error('z should not be less than 500');
      return;
    }

    this.paneMgr.setZ(this.pane, z);
  }

  override mount(parent: WikMap): void {
    super.mount(parent);
    this.paneMgr.get(this.pane, 'none', _pane_z_seed++);
    this.svgServer.bootstrap(parent, this.pane);
  }
}

let _pane_z_seed = 500;
