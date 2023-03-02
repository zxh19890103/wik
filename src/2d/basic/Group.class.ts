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
} from '@/model';

import { PaneManager, WikPane } from '../state/PaneManager.class';
import { leafletOptions } from '../utils';
import { ContextMenuItem, Interactive, OnInteractive, WithLayerState } from '@/interfaces';

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
  pane?: string;
}

@leafletOptions<GroupOptions>({
  pane: 'group',
})
export class Group<S = {}>
  extends mix(L.Layer).with<L.Layer, ReactiveLayer>(ReactiveLayerMixin)
  implements OnInteractive
{
  @inject(interfaces.IPaneManager)
  readonly paneMgr: PaneManager;
  @inject(interfaces.IModeManager)
  readonly modeMgr: ModeManager;
  @inject(interfaces.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;

  readonly paneObj: WikPane;
  readonly options: GroupOptions;

  constructor(layers: ReactiveLayer[] = [], options?: GroupOptions) {
    super();
    this.addChild(...layers);
    L.Util.setOptions(this, options);

    /**
     * Que: Why do not this block of code just shared the same logic of LayerList?
     * Ans: Group is extended from leaflet and thus has the L.Evented features,
     * but List is extended from Emitter3
     */
    this.on('click dblclick mousedown mouseover mouseout contextmenu', (evt) => {
      L.DomEvent.stop(evt);
      if (
        evt.type === 'click' &&
        (evt.propagatedFrom as unknown as WithClickCancel).isClickEventFireCancelled
      )
        return;
      const onCb = leafletEvent2OnCallback[evt.type];
      this.modeMgr.apply(onCb, this, evt);
    });
  }

  override onAdd(map: L.Map): this {
    const paneObj = this.paneMgr.get(this.options.pane, 'canvas', _pane_z_seed++);
    L.Util.setOptions(this, { renderer: paneObj.renderer });
    util$$.writeReadonlyProp(this, 'paneObj', paneObj);
    super.onAdd(map);
    return this;
  }

  onClick(e?: L.LeafletMouseEvent): void {
    this.traverse<Interactive>((child) => {
      child.onClick && child.onClick(e);
    });
  }

  onDblClick(e?: L.LeafletMouseEvent): void {
    this.traverse<Interactive>((child) => {
      child.onDblClick && child.onDblClick(e);
    });
  }

  onDragStart(): void {}
  onDragging(latlng?: L.LatLng): void {}
  onDragEnd(latlng?: L.LatLng): void {}

  onContextMenu(evt?: L.LeafletMouseEvent): ContextMenuItem[] {
    return [
      {
        text: 'Del',
        value: 'del',
      },
    ];
  }

  onContextMenuClick(key: string): void | Promise<any> {
    switch (key) {
      case 'del': {
        alert('del?');
        break;
      }
    }
  }

  onHighlight() {
    this.traverse<Interactive>((child) => {
      this.interactiveStateActionManager.push(child, 'Highlight');
    });
  }

  onUnHighlight(state?: any): void {
    this.traverse<Interactive>((child) => {
      this.interactiveStateActionManager.pop(child, 'Highlight');
    });
  }

  onHover() {
    this.traverse<Interactive>((child) => {
      this.interactiveStateActionManager.push(child, 'Hover');
    });
  }

  onUnHover(state?: any): void {
    this.traverse<Interactive>((child) => {
      this.interactiveStateActionManager.pop(child, 'Hover');
    });
  }

  onSelect() {
    this.traverse<Interactive>((child) => {
      this.interactiveStateActionManager.push(child, 'Select');
    });
  }

  onUnSelect(state?: any): void {
    this.traverse<Interactive>((child) => {
      this.interactiveStateActionManager.pop(child, 'Select');
    });
  }
}

export interface Group<S = {}> extends WithLayerState<S> {}

let _pane_z_seed = 451;
