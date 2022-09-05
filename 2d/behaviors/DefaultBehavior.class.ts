import { Behavior } from '../../model/behaviors';
import { inject } from '../../model/basic/inject';
import { SelectionManager } from '../basic';
import * as Interface from '../../interfaces/symbols';
import { InteractiveStateActionManager } from '../../mixins/InteractiveStateActionManager.class';
import { InteractiveStateAction } from '../../mixins/InteractiveStateAction.class';
import { Interactive } from '../../interfaces/Interactive';

export class DefaultBehavior extends Behavior {
  @inject(Interface.ISelectionManager)
  readonly selectionManager: SelectionManager;
  @inject(Interface.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;

  override onLoad(): void {
    console.log('load DefaultBehavior');
  }

  override onUnload(): void {}

  override onHover(layer: Interactive, on: boolean): void {
    if (!layer.onHover || !layer.onUnHover) return;
    if (on) {
      this.interactiveStateActionManager.push(new InteractiveStateAction(layer, 'Hover'));
    } else {
      this.interactiveStateActionManager.pop(layer, 'Hover');
    }
  }

  override onClick(layer: Interactive): void {
    if (!layer.onSelect || !layer.onUnSelect) return;
    this.selectionManager.current(layer);
  }
}
