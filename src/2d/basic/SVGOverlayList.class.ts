import L from 'leaflet';
import { LayerWithID } from '@/interfaces';
import { util$$, inject, interfaces } from '@/model';
import { LayerList } from './LayerList.class';
import { WikMap } from './Map.class';
import { PaneManager, WikPane } from '../state/PaneManager.class';
import { ReactSVGOverlayAppServer } from './ReactSVGOverlayApp';

export class SVGOverlayList<M extends LayerWithID, E extends string = never> extends LayerList<
  M,
  E
> {
  readonly pane: string;
  readonly paneObj: WikPane;
  readonly svgServer: ReactSVGOverlayAppServer;

  @inject(interfaces.IPaneManager)
  readonly paneMgr: PaneManager;

  constructor(pane: string) {
    super([]);
    this.svgServer = new ReactSVGOverlayAppServer();
    this.pane = pane;
  }

  protected override _add(item: M): void {
    L.Util.setOptions(item, { pane: this.paneObj.fullname });
    util$$.writeProp(item, 'svgServer', this.svgServer);

    super._add(item);
  }

  protected override _remove(item: M): void {
    super._remove(item);

    L.Util.setOptions(item, { pane: null });
    util$$.writeProp(item, 'svgServer', null);
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
    const paneObj = this.paneMgr.get(this.pane, 'overlay');
    util$$.writeProp(this, 'paneObj', paneObj);
    this.svgServer.bootstrap(parent, this.pane);
  }

  dispose(): void {
    this.paneObj.remove();
    this.svgServer.teardown();
  }
}
