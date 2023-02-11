import { Behavior } from '@/model/behaviors';
import { inject } from '@/model/basic/inject';
import Interface from '@/interfaces/symbols';
import { InteractiveStateActionManager } from '@/model/state';
import { InteractiveObject3D } from '../IInteractive3D';
import { ISelectionManager } from '@/interfaces/Selection';

export class DefaultBehavior extends Behavior {
  @inject(Interface.ISelectionManager)
  readonly selectionManager: ISelectionManager;
  @inject(Interface.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;

  override onLoad(): void {}
  override onUnload(): void {}

  override onHover(layer: InteractiveObject3D, e: unknown): void {
    if (!layer.onHover || !layer.onUnHover) return;

    this.interactiveStateActionManager.push(layer, 'Hover', e);
  }

  override onUnHover(layer: InteractiveObject3D, e: unknown): void {
    if (!layer.onHover || !layer.onUnHover) return;

    this.interactiveStateActionManager.pop(layer, 'Hover');
  }

  override onDblClick(layer: InteractiveObject3D, e: unknown): void {
    layer.onDblClick && layer.onDblClick(e);
  }

  override onClick(layer: InteractiveObject3D, e: any): void {
    layer.onClick && layer.onClick(e);

    if (!layer.onSelect || !layer.onUnSelect) return;

    this.selectionManager.clearMany();

    this.selectionManager.current(layer, e);
  }
}
