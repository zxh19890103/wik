import {
  inject,
  interfaces,
  Behavior,
  SelectionManager,
  InteractiveStateActionManager,
} from '@/model';
import { Group } from '../basic';

import { InteractiveReactiveLayer } from '../interfaces';

export class DefaultBehavior extends Behavior {
  @inject(interfaces.ISelectionManager)
  readonly selectionManager: SelectionManager;
  @inject(interfaces.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;

  override onLoad(): void {}
  override onUnload(): void {}

  private isHoverable(item: InteractiveReactiveLayer) {
    return (item.onHover && item.onUnHover) || item instanceof Group;
  }

  private isSelectable(item: InteractiveReactiveLayer) {
    return !!item.onSelect && !!item.onUnSelect;
  }

  override onHover(layer: InteractiveReactiveLayer, e: L.LeafletMouseEvent): void {
    if (!this.isHoverable(layer)) return;

    this.interactiveStateActionManager.push(layer, 'Hover');
    layer.traverse<InteractiveReactiveLayer>((layer) => {
      if (!this.isHoverable(layer)) return;
      this.interactiveStateActionManager.push(layer, 'Hover');
    });
  }

  override onUnHover(layer: InteractiveReactiveLayer, e: L.LeafletMouseEvent): void {
    if (!this.isHoverable(layer)) return;

    this.interactiveStateActionManager.pop(layer, 'Hover');
    layer.traverse<InteractiveReactiveLayer>((layer) => {
      if (!this.isHoverable(layer)) return;
      this.interactiveStateActionManager.pop(layer, 'Hover');
    });
  }

  override onDblClick(layer: InteractiveReactiveLayer, e: L.LeafletMouseEvent): void {
    layer.onDblClick && layer.onDblClick(e);
  }

  override onNoopClick(evt: unknown): void {
    this.selectionManager.clear();
  }

  override onClick(layer: InteractiveReactiveLayer, e: L.LeafletMouseEvent): void {
    layer.onClick && layer.onClick(e);

    if (!this.isSelectable(layer)) return;

    this.selectionManager.clearMany();
    this.selectionManager.current(layer);
  }
}
