import L from 'leaflet';
import { LayerWithID } from '../../interfaces/WithLayerID';
import { writeReadonlyProp } from '../../model/basic';
import { inject } from '../../model/basic/inject';
import { LayerList } from './LayerList.class';
import { HrMap } from './Map.class';
import { PaneManager, PaneName } from '../state/PaneManager.class';
import { ReactSVGOverlayAppServer } from './ReactSVGOverlayApp';
import * as Interface from '../../interfaces/symbols';

let __pane_z_seed = 500;

export class SVGOverlayList<M extends LayerWithID, E extends string = never> extends LayerList<
  M,
  E
> {
  readonly pane: PaneName;
  readonly svgServer: ReactSVGOverlayAppServer;

  @inject(Interface.IPaneManager)
  readonly paneMgr: PaneManager;

  constructor(pane: PaneName) {
    super([]);
    this.svgServer = new ReactSVGOverlayAppServer();
    this.pane = pane;
  }

  onItemAdd(item: M): void {
    L.Util.setOptions(item, { pane: this.pane });
    writeReadonlyProp(item, 'svgServer', this.svgServer);
    writeReadonlyProp(item, '$$list', this);
  }

  override mount(parent: HrMap): void {
    super.mount(parent);
    this.paneMgr.get(this.pane, 'none', __pane_z_seed++);
    this.svgServer.bootstrap(parent, this.pane);
  }
}
