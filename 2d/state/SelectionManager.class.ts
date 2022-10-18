import { Interactive } from '../../interfaces/Interactive';
import { ISelectionManager } from '../../interfaces/Selection';
import { WithEmitter, EmitterMix } from '../../mixins/Emitter';
import { InteractiveStateActionManager } from './InteractiveStateActionManager.class';
import { mixin } from '../../model/basic';
import { inject, injectable } from '../../model/basic/inject';
import * as Interface from '../../interfaces/symbols';

type SelectionManagerEventType = 'item' | 'items';

@mixin(EmitterMix)
@injectable({ providedIn: 'root', provide: Interface.ISelectionManager })
export class SelectionManager
  extends EventEmitter3<SelectionManagerEventType>
  implements ISelectionManager
{
  private item: Interactive = null;
  private items: Interactive[] = [];

  @inject(Interface.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;

  getCurrent(): Interactive {
    return this.item;
  }

  getMany(): Interactive[] {
    return this.items || [];
  }

  protected setItem(item: Interactive) {
    this.item = item;
    this.emit('item', { item });
  }

  protected setItems(items: Interactive[]) {
    this.items = items;
    this.emit('items', { items });
  }

  current(item: Interactive) {
    if (item === this.item) return;

    if (this.item) {
      this.interactiveStateActionManager.pop(this.item, 'Select');
    }

    this.interactiveStateActionManager.push(item, 'Select');
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

export interface SelectionManager extends WithEmitter<SelectionManagerEventType> {}
