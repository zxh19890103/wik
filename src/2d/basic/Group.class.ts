import L from 'leaflet';
import { ReactiveLayer, ReactiveLayerMixin } from '@/mixins';
import {
  mix,
  inject,
  util$$,
  interfaces,
  InteractiveStateActionManager,
  ModeManager,
  WithClickCancel,
  const$$,
} from '@/model';

import { PaneManager, WikPane } from '../state/PaneManager.class';
import { leafletOptions } from '../utils';
import { WithLayerState } from '@/interfaces';
import { ReactiveLayerRenderingMode } from '@/mixins/ReactiveLayer';
import { ReactSVGOverlayAppServer } from './ReactSVGOverlayApp';
import { WikMap } from './Map.class';
import { ReactSVGOverlay } from './ReactSVGOverlay.class';

/**
 * Group in Group
 *
 *
 */

interface GroupOptions {
  /**
   * avoid conflicting with leaflet options.pane!
   * @default group
   */
  paneName?: string;
  /**
   * if you need add overlay in the group.
   */
  needOverlay?: boolean;
  svgServer?: ReactSVGOverlayAppServer;
}

@leafletOptions<GroupOptions>({
  paneName: null,
  needOverlay: false,
  svgServer: null,
})
export class Group<S = {}> extends mix(L.Layer).with<L.Layer, ReactiveLayer>(ReactiveLayerMixin) {
  @inject(interfaces.IPaneManager)
  readonly paneMgr: PaneManager;
  @inject(interfaces.IModeManager)
  readonly modeMgr: ModeManager;
  @inject(interfaces.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;

  readonly paneObj: WikPane;
  readonly paneObj2: WikPane;
  readonly paneObj3: WikPane;

  readonly svgServer: ReactSVGOverlayAppServer;

  readonly renderingMode: ReactiveLayerRenderingMode = 'mixed';

  readonly options: GroupOptions;

  constructor(layers: ReactiveLayer[] = [], options?: GroupOptions) {
    super();
    L.Util.setOptions(this, options);

    if (this.options.needOverlay && !this.options.svgServer) {
      util$$.writeProp(this, 'svgServer', new ReactSVGOverlayAppServer());
    } else if (this.options.svgServer) {
      util$$.writeProp(this, 'svgServer', this.options.svgServer);
    }

    this.addChild(...layers);
  }

  override addChild(...children: ReactiveLayer<any>[]): void {
    for (const child of children) {
      if (child instanceof ReactSVGOverlay) {
        util$$.writeProp(child, 'svgServer', this.svgServer);
      }
    }

    super.addChild(...children);
  }

  override removeChild(...children: ReactiveLayer<any>[]): void {
    for (const child of children) {
      if (child instanceof ReactSVGOverlay) {
        util$$.writeProp(child, 'svgServer', null);
      }
    }

    super.removeChild(...children);
  }

  override onAdd(map: L.Map): this {
    const pane = this.options.paneName ?? `group${group_pane_id_seed++}`;

    const paneObj = this.paneMgr.get(pane, 'canvas');
    const paneObj2 = this.paneMgr.get(pane + '_marker', 'marker');
    const paneObj3 = this.paneMgr.get(pane + `_overlay${group_pane_overlay_id++}`, 'overlay');

    if (this.options.needOverlay) {
      this.svgServer.bootstrap(map as WikMap, paneObj3.name);
    }

    L.Util.setOptions(this, {
      renderer: paneObj.renderer,
      pane: paneObj.fullname,
      pane2: paneObj2.fullname,
      pane3: paneObj3.fullname,
    });

    util$$.writeProp(this, 'paneObj', paneObj);
    util$$.writeProp(this, 'paneObj2', paneObj2);
    util$$.writeProp(this, 'paneObj3', paneObj3);

    super.onAdd(map);
    return this;
  }

  onRemove(map: L.Map): this {
    super.onRemove(map);

    this.paneObj.remove();
    this.paneObj2.remove();
    this.paneObj3.remove();

    this.svgServer?.teardown();

    util$$.writeProp(this, 'paneObj', null);
    util$$.writeProp(this, 'paneObj2', null);
    util$$.writeProp(this, 'paneObj3', null);

    return this;
  }
}

let group_pane_id_seed = 2023;
let group_pane_overlay_id = 2039;

export interface Group<S = {}> extends WithLayerState<S> {}
