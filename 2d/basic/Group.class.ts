import L from 'leaflet';
import { ReactiveLayer } from '../../mixins/ReactiveLayer';
import { Interactive, OnInteractive } from '../../interfaces/Interactive';
import { inject, mix, writeReadonlyProp } from '../../model/basic';
import { ReactiveLayerMixin } from '../../mixins/ReactiveLayer.mixin';
import {
  InteractiveStateAction,
  InteractiveStateActionManager,
  PaneManager,
  PaneName,
  PaneObject,
} from '../state';
import {
  IModeManager,
  IPaneManager,
  IRendererManager,
  IStateActionManager,
} from '../../interfaces/symbols';
import { leafletOptions } from '../../utils';
import { RenderersManager } from '../leafletCanvasOverrides';
import { ModeManager } from '../../model/modes';
import { ContextMenuItem } from '../../interfaces/types';
import { WithClickCancel } from '../../mixins/ClickCancel';

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
  pane?: PaneName;
}

@leafletOptions<GroupOptions>({
  pane: 'groupPane',
})
export class Group
  extends mix(L.Layer).with<L.Layer, ReactiveLayer>(ReactiveLayerMixin)
  implements OnInteractive
{
  @inject(IPaneManager)
  readonly paneMgr: PaneManager;
  @inject(IRendererManager)
  readonly rendererMgr: RenderersManager;
  @inject(IModeManager)
  readonly modeMgr: ModeManager;
  @inject(IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;

  readonly paneObj: PaneObject;
  readonly options: GroupOptions;

  constructor(layers: ReactiveLayer[] = [], options?: GroupOptions) {
    super();
    this.addChild(...layers);
    L.Util.setOptions(this, options);

    this.on('click dblclick mousedown mouseover mouseout contextmenu', (evt) => {
      L.DomEvent.stop(evt);
      if (
        evt.type === 'click' &&
        (evt.propagatedFrom as unknown as WithClickCancel).isObjClickEventCancelled
      )
        return;
      const onCb = leafletEvent2OnCallback[evt.type];
      this.modeMgr.apply(onCb, this, evt);
    });
  }

  override onAdd(map: L.Map): this {
    const paneObj = this.paneMgr.get(this.options.pane, 'canvas', __pane_z_seed++);
    L.Util.setOptions(this, { renderer: paneObj.renderer });
    writeReadonlyProp(this, 'paneObj', paneObj);
    this.rendererMgr.add(paneObj.name, paneObj.renderer);
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
      this.interactiveStateActionManager.push(new InteractiveStateAction(child, 'Highlight'));
    });
  }

  onUnHighlight(state?: any): void {
    this.traverse<Interactive>((child) => {
      this.interactiveStateActionManager.pop(child, 'Highlight');
    });
  }

  onHover() {
    this.traverse<Interactive>((child) => {
      this.interactiveStateActionManager.push(new InteractiveStateAction(child, 'Hover'));
    });
  }

  onUnHover(state?: any): void {
    this.traverse<Interactive>((child) => {
      this.interactiveStateActionManager.pop(child, 'Hover');
    });
  }

  onSelect() {
    this.traverse<Interactive>((child) => {
      this.interactiveStateActionManager.push(new InteractiveStateAction(child, 'Select'));
    });
  }

  onUnSelect(state?: any): void {
    this.traverse<Interactive>((child) => {
      this.interactiveStateActionManager.pop(child, 'Select');
    });
  }
}

let __pane_z_seed = 451;
