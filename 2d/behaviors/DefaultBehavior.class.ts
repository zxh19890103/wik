import { Behavior } from '../../model/behaviors';
import { inject } from '../../model/basic/inject';
import { InteractiveStateActionManager } from '../state/InteractiveStateActionManager.class';
import { InteractiveStateAction } from '../state/InteractiveStateAction.class';
import { Interactive } from '../../interfaces/Interactive';
import * as Interface from '../../interfaces/symbols';
import { SelectionManager } from '../state';
import { GraphicObject } from '../../interfaces/GraghicObject';

export class DefaultBehavior extends Behavior {
  @inject(Interface.ISelectionManager)
  readonly selectionManager: SelectionManager;
  @inject(Interface.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;

  override onLoad(): void {}
  override onUnload(): void {}

  override onHover(layer: Interactive, e: L.LeafletMouseEvent): void {
    this.interactiveStateActionManager.push(new InteractiveStateAction(layer, 'Hover'));
  }

  override onUnHover(layer: Interactive, e: L.LeafletMouseEvent): void {
    this.interactiveStateActionManager.pop(layer, 'Hover');
  }

  override onDblClick(layer: Interactive, e: L.LeafletMouseEvent): void {
    layer.onDblClick && layer.onDblClick(e);
  }

  override onClick(layer: Interactive, e: L.LeafletMouseEvent): void {
    layer.onClick && layer.onClick(e);

    if (!this.selectionManager.isSelectable(layer)) return;

    this.selectionManager.clearAll();
    this.selectionManager.current(layer);
  }
}
