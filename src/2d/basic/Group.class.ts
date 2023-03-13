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
import { ContextMenuItem, OnContextMenu, WithLayerState } from '@/interfaces';
import { ReactiveLayerRenderingMode } from '@/mixins/ReactiveLayer';
import { ReactSVGOverlayAppServer } from './ReactSVGOverlayApp';
import { WikMap } from './Map.class';
import { ReactSVGOverlay } from './ReactSVGOverlay.class';

interface GroupOptions {
  /**
   * @default group
   */
  paneName?: string;
  /**
   * if you need add overlay in the group.
   */
  needOverlay?: boolean;
}

@leafletOptions<GroupOptions>({
  paneName: 'group',
  needOverlay: false,
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

  readonly svgSever: ReactSVGOverlayAppServer;

  readonly renderingMode: ReactiveLayerRenderingMode = 'mixed';

  readonly options: GroupOptions;

  constructor(layers: ReactiveLayer[] = [], options?: GroupOptions) {
    super();
    L.Util.setOptions(this, options);

    if (this.options.needOverlay) {
      this.svgSever = new ReactSVGOverlayAppServer();
    }

    this.addChild(...layers);
    /**
     * Que: Why do not this block of code just shared the same logic of LayerList?
     * Ans: Group is extended from leaflet and thus has the L.Evented features,
     * but List is extended from Emitter3
     */
    this.on('click dblclick mousedown contextmenu', (evt) => {
      L.DomEvent.stop(evt);
      if (
        evt.type === 'click' &&
        (evt.propagatedFrom as unknown as WithClickCancel).isClickEventFireCancelled
      )
        return;
      this.modeMgr.apply(const$$.event2behavior[`item@${evt.type}`], this, evt);
    });

    let mouseout_timer = null;
    let is_hovered = false;

    this.on('mouseover mouseout', (evt) => {
      L.DomEvent.stop(evt);

      if (is_hovered && evt.type === 'mouseout') {
        mouseout_timer = setTimeout(() => {
          is_hovered = false;
          mouseout_timer = null;
          this.modeMgr.apply(const$$.event2behavior[`item@${evt.type}`], this, evt);
        }, 32);
      } else {
        if (mouseout_timer) {
          clearTimeout(mouseout_timer);
          mouseout_timer = null;
        }

        if (!is_hovered) {
          is_hovered = true;
          this.modeMgr.apply(const$$.event2behavior[`item@${evt.type}`], this, evt);
        }
      }
    });
  }

  override addChild(...children: ReactiveLayer<any>[]): void {
    for (const child of children) {
      if (child instanceof ReactSVGOverlay) {
        util$$.writeProp(child, 'svgServer', this.svgSever);
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
    const paneObj = this.paneMgr.get(this.options.paneName, 'canvas');
    const paneObj2 = this.paneMgr.get(this.options.paneName + '_marker', 'marker');
    const paneObj3 = this.paneMgr.get(this.options.paneName + '_overlay', 'overlay');

    if (this.options.needOverlay) {
      this.svgSever.bootstrap(map as WikMap, paneObj3.name);
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

    this.svgSever?.teardown();

    util$$.writeProp(this, 'paneObj', null);
    util$$.writeProp(this, 'paneObj2', null);
    util$$.writeProp(this, 'paneObj3', null);

    return this;
  }
}

export interface Group<S = {}> extends WithLayerState<S> {}
