import { InteractiveStateActionManager, Behavior, inject, interfaces } from '@/model';
import { InteractiveObject3D } from '../IInteractive3D';
import { GraphicObject, ISelectionManager } from '@/interfaces';

export class DefaultBehavior extends Behavior {
  @inject(interfaces.ISelectionManager)
  readonly selectionManager: ISelectionManager;
  @inject(interfaces.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;

  override onLoad(): void {}
  override onUnload(): void {}

  onPress(obj: GraphicObject, evt: unknown): void {
    console.log('pressed', obj);
  }

  onMouseDown(evt: unknown): void {
    console.log('mouse down on', evt);
  }

  onMouseMove(evt: unknown): void {
    console.log('mouse move...');
  }

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
