import { Behavior } from '../../model/behaviors';
import { inject } from '../../model/basic/inject';
import { SelectionManager } from '../basic';
import { InteractiveStateActionManager } from '../../mixins/InteractiveStateActionManager.class';
import { InteractiveStateAction } from '../../mixins/InteractiveStateAction.class';
import { Interactive } from '../../interfaces/Interactive';
import * as Interface from '../../interfaces/symbols';

export class DefaultBehavior extends Behavior {
  @inject(Interface.ISelectionManager)
  readonly selectionManager: SelectionManager;
  @inject(Interface.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;

  override onLoad(): void {}

  override onUnload(): void {}

  override onHover(layer: Interactive, on: boolean): void {
    if (!layer.onHover || !layer.onUnHover) return;
    if (on) {
      this.interactiveStateActionManager.push(new InteractiveStateAction(layer, 'Hover'));
    } else {
      this.interactiveStateActionManager.pop(layer, 'Hover');
    }
  }

  onNoopClick(evt: unknown): void {
    console.log('noop clicked');
  }

  override onDblClick(layer: Interactive, e: L.LeafletMouseEvent): void {
    layer.onDblClick && layer.onDblClick(e);
  }

  override onClick(layer: Interactive, e: L.LeafletMouseEvent): void {
    console.log('ha you clicked', layer);
    layer.onClick && layer.onClick(e);

    if (layer.onSelect && layer.onUnSelect) {
      this.selectionManager.current(layer);
    }
  }
}
