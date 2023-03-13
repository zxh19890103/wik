import { SelectionManager as SelectionManagerBase } from '@/model';
import { InteractiveReactiveLayer } from '../interfaces';

export class SelectionManager extends SelectionManagerBase<InteractiveReactiveLayer> {
  protected override _select(item: InteractiveReactiveLayer, data?: any): void {
    this.interactiveStateActionManager.push(item, 'Select', data);

    item.traverse<InteractiveReactiveLayer>((child) => {
      this.interactiveStateActionManager.push(child, 'Select');
    });
  }

  protected override _unselect(item: InteractiveReactiveLayer): void {
    this.interactiveStateActionManager.pop(item, 'Select');

    item.traverse<InteractiveReactiveLayer>((child) => {
      this.interactiveStateActionManager.pop(child, 'Select');
    });
  }
}
