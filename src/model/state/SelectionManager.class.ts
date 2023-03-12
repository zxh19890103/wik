import { Interactive } from '@/interfaces';
import { ISelectionManager } from '@/interfaces';
import { InteractiveStateActionManager } from './InteractiveStateActionManager.class';
import { Core } from '../basic/Core.class';
import { inject, injectable } from '../basic/inject';
import interfaces from '../symbols';

type SelectionManagerEventType = 'item' | 'items';

@injectable({ providedIn: 'root', provide: interfaces.ISelectionManager })
export class SelectionManager<I extends Interactive = Interactive>
  extends Core<SelectionManagerEventType>
  implements ISelectionManager
{
  private item: I = null;
  private items: I[] = [];

  @inject(interfaces.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;

  getCurrent(): I {
    return this.item;
  }

  getMany(): I[] {
    return this.items || [];
  }

  protected setItem(item: I) {
    this.item = item;
    this.fire('item', { item });
  }

  protected setItems(items: I[]) {
    this.items = items;
    this.fire('items', { items });
  }

  protected _select(item: I, data?: any) {
    this.interactiveStateActionManager.push(item, 'Select', data);
  }

  protected _unselect(item: I) {
    this.interactiveStateActionManager.pop(item, 'Select');
  }

  current(item: I, data?: any) {
    if (item === this.item) return false;

    if (this.item) {
      this._unselect(this.item);
    }

    this._select(item, data);
    this.setItem(item);

    return true;
  }

  many(layers: I[]): void {
    const items = [];
    for (const layer of layers) {
      items.push(layer);
      this._select(layer);
    }

    this.setItems(items);
  }

  append(item: I) {
    if (this.items.indexOf(item) > -1) return;
    this._select(item);
    this.setItems([...this.items, item]);
  }

  isSelectable(item: I) {
    return !!item.onSelect && !!item.onUnSelect;
  }

  clearCurrent() {
    if (!this.item) return;
    this._unselect(this.item);
    this.setItem(null);
  }

  clearMany() {
    for (const item of this.items) {
      this._unselect(item);
    }

    this.setItems([]);
  }

  clear(): void {
    this.clearCurrent();
    this.clearMany();
  }
}
