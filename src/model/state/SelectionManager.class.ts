import { Interactive } from '@/interfaces/Interactive';
import { ISelectionManager } from '@/interfaces/Selection';
import { InteractiveStateActionManager } from './InteractiveStateActionManager.class';
import { Core } from '../basic/Core.class';
import { inject, injectable } from '../basic/inject';
import interfaces from '../symbols';

type SelectionManagerEventType = 'item' | 'items';

@injectable({ providedIn: 'root', provide: interfaces.ISelectionManager })
export class SelectionManager extends Core<SelectionManagerEventType> implements ISelectionManager {
  private item: Interactive = null;
  private items: Interactive[] = [];

  @inject(interfaces.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;

  getCurrent(): Interactive {
    return this.item;
  }

  getMany(): Interactive[] {
    return this.items || [];
  }

  protected setItem(item: Interactive) {
    this.item = item;
    this.fire('item', { item });
  }

  protected setItems(items: Interactive[]) {
    this.items = items;
    this.fire('items', { items });
  }

  current(item: Interactive, data?: any) {
    if (item === this.item) return;

    if (this.item) {
      this.interactiveStateActionManager.pop(this.item, 'Select');
    }

    this.interactiveStateActionManager.push(item, 'Select', data);
    this.setItem(item);
  }

  many(layers: Interactive[]): void {
    const items = [];
    for (const layer of layers) {
      items.push(layer);
      this.interactiveStateActionManager.push(layer, 'Select');
    }

    this.setItems(items);
  }

  append(item: Interactive) {
    if (this.items.indexOf(item) > -1) return;
    this.interactiveStateActionManager.push(item, 'Select');
    this.setItems([...this.items, item]);
  }

  isSelectable(item: Interactive) {
    return !!item.onSelect && !!item.onUnSelect;
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
