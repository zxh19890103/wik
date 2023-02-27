import {
  inject,
  interfaces,
  Behavior,
  SelectionManager,
  InteractiveStateActionManager,
} from '@/model';
import { Interactive } from '@/interfaces';

export class DefaultBehavior extends Behavior {
  @inject(interfaces.ISelectionManager)
  readonly selectionManager: SelectionManager;
  @inject(interfaces.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;

  override onLoad(): void {}
  override onUnload(): void {}

  override onHover(layer: Interactive, e: L.LeafletMouseEvent): void {
    this.interactiveStateActionManager.push(layer, 'Hover');
  }

  override onUnHover(layer: Interactive, e: L.LeafletMouseEvent): void {
    this.interactiveStateActionManager.pop(layer, 'Hover');
  }

  override onDblClick(layer: Interactive, e: L.LeafletMouseEvent): void {
    layer.onDblClick && layer.onDblClick(e);
  }

  onNoopClick(evt: unknown): void {
    console.log('noop click');
  }

  override onClick(layer: Interactive, e: L.LeafletMouseEvent): void {
    layer.onClick && layer.onClick(e);

    if (!this.selectionManager.isSelectable(layer)) return;

    this.selectionManager.clearMany();
    this.selectionManager.current(layer);
  }
}
