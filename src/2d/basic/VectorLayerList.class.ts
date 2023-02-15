import L from 'leaflet';
import { LayerWithID } from '@/interfaces';
import { util$$, inject, interfaces } from '@/model';
import { LayerList } from './LayerList.class';
import { WikMap } from './Map.class';
import { PaneManager, PaneName, PaneObject, RendererType } from '../state/PaneManager.class';
import { RenderersManager } from '../leafletCanvasOverrides';

export class VectorLayerList<M extends LayerWithID, E extends string = never> extends LayerList<
  M,
  E
> {
  @inject(interfaces.IPaneManager)
  readonly paneMgr: PaneManager;
  @inject(interfaces.IRendererManager)
  readonly rendererMgr: RenderersManager;

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

  protected override _add(item: M): void {
    L.Util.setOptions(item, { renderer: this.paneObj.renderer });
    super._add(item);
  }

  override setZ(z: number) {
    if (!__PROD__ && z > 499) {
      console.error('z should not be greater than 500');
      return;
    }

    this.paneMgr.setZ(this.pane, z);
  }

  override mount(parent: WikMap): void {
    super.mount(parent);
    const paneObj = this.paneMgr.get(this.pane, this.rendererType, _pane_z_seed++);
    util$$.writeReadonlyProp(this, 'paneObj', paneObj);
    this.rendererMgr.add(paneObj.name, paneObj.renderer);
  }
}

let _pane_z_seed = 402;
