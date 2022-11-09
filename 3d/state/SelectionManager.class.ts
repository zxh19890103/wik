import { Interactive } from '../../interfaces/Interactive';
import { ISelectionManager } from '../../interfaces/Selection';
import { InteractiveStateActionManager } from '../../model/state/InteractiveStateActionManager.class';
import * as Interface from '../../interfaces/symbols';
import { Core, inject, injectable } from '../../model/basic';
import { Interactive3D } from '../IInteractive3D';

type SelectionManagerEventType = 'item' | 'items';

@injectable()
export class Selection3DManager
  extends Core<SelectionManagerEventType>
  implements ISelectionManager
{
  private item: Interactive3D = null;
  private items: Interactive3D[] = [];

  @inject(Interface.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;

  getCurrent(): Interactive3D {
    return this.item;
  }

  getMany(): Interactive3D[] {
    return this.items || [];
  }

  protected setItem(item: Interactive3D) {
    this.item = item;
    this.fire('item', { item });
  }

  protected setItems(items: Interactive3D[]) {
    this.items = items;
    this.fire('items', { items });
  }

  isEq(item0: Interactive3D, item1: Interactive3D) {
    if (item0 === item1) {
      return true;
    }

    if (!item0 || !item1) {
      return false;
    }

    if (item0.isInstancedMesh !== item1.isInstancedMesh) {
      return false;
    }

    if (item0.isInstancedMesh) {
      // both are
      return item0.obj3d === item1.obj3d && item0.instanceId === item1.instanceId;
    } else {
      return item0.obj3d === item1.obj3d;
    }
  }

  current(item: Interactive3D) {
    if (this.isEq(item, this.item)) return;

    if (this.item) {
      this.interactiveStateActionManager.pop(this.item.obj3d, 'Select');
    }

    this.interactiveStateActionManager.push(item.obj3d, 'Select', { instanceId: item.instanceId });
    this.setItem(item);
  }

  many(layers: Interactive3D[]): void {
    const items = [];
    for (const layer of layers) {
      items.push(layer);
      this.interactiveStateActionManager.push(layer, 'Select', { insatnceId: layer.instanceId });
    }

    this.setItems(items);
  }

  append(item: Interactive3D) {
    throw new Error('not implemented');
    // if (this.items.indexOf(item) > -1) return;
    // this.interactiveStateActionManager.push(item, 'Select');
    // this.setItems([...this.items, item]);
  }

  isSelectable(item: Interactive3D): boolean {
    throw new Error('not implemented');
  }

  clearCurrent() {
    if (!this.item) return;
    this.interactiveStateActionManager.pop(this.item, 'Select');
    this.setItem(null);
  }

  clearMany() {
    for (const item of this.items) {
      this.interactiveStateActionManager.pop(item, 'Select');
    }

    this.setItems([]);
  }

  clear(): void {
    this.clearCurrent();
    this.clearMany();
  }
}
