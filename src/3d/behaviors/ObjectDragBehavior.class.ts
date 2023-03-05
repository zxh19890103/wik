import { InteractiveStateActionManager, Behavior, inject, interfaces } from '@/model';
import { GraphicObject, ISelectionManager } from '@/interfaces';
import { Warehouse3D } from '../Warehouse.class';

export class ObjectDragBehavior extends Behavior {
  @inject(interfaces.ISelectionManager)
  readonly selectionManager: ISelectionManager;
  @inject(interfaces.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;

  constructor(private warehouse: Warehouse3D) {
    super();
  }

  override onLoad(): void {}
  override onUnload(): void {}

  onPress(obj: GraphicObject, evt: unknown): void {
    // this.warehouse.controls.enabled = false;
    console.log('pressed', obj);
  }

  onMouseDown(evt: unknown): void {
    console.log('mouse down');
  }

  onMouseMove(evt: unknown): void {
    console.log('mouse moving...');
    console.log(evt);
  }

  onMouseUp(evt: unknown): void {
    console.log('mouse up');
  }
}
