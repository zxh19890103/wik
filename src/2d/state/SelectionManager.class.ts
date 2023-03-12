import { SelectionManager as SelectionManagerBase } from '@/model';
import { InteractiveReactiveLayer } from '../interfaces';

export class SelectionManager extends SelectionManagerBase<InteractiveReactiveLayer> {
  protected override _select(item: InteractiveReactiveLayer, data?: any): void {
    super._select(item, data);

    item.traverse<InteractiveReactiveLayer>((child) => {
      super._select(child, null);
    });
  }

  protected override _unselect(item: InteractiveReactiveLayer): void {
    super._unselect(item);

    item.traverse<InteractiveReactiveLayer>((child) => {
      super._unselect(child);
    });
  }
}
