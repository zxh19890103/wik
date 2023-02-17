import { EventEmitter } from 'eventemitter3';
import { EmitterMix, WithEmitter } from '@/model/basic/Emitter';
import { IList } from './IList';
import { mixin } from './mixin';

export interface Core<E extends string = string> extends WithEmitter<E> {}

@mixin(EmitterMix)
export abstract class Core<E extends string = string> extends EventEmitter<E> {
  assign(pairs: string | Record<string, any>, value?: any) {
    if (!pairs) return;

    if (typeof pairs === 'string') {
      if (value === undefined) return;
      this[pairs] = value;
    } else {
      for (const key in pairs) {
        this[key] = pairs[key];
      }
    }
  }
}

export abstract class CoreList<M = any, E extends string = never>
  extends Core<E | CoreListEventType>
  implements IList<M>
{
  readonly items: Set<M> = new Set();
  readonly index: Map<string, M> = new Map();
  size = 0;

  protected isBatching = false;

  *[Symbol.iterator]() {
    for (const item of this.items) {
      yield item;
    }
  }

  constructor(items?: M[]) {
    super();

    if (items) {
      this.noEmit = true;
      this.addArr(items);
    }
  }

  add(item: M): void {
    this._add(item);

    if (this.isBatching) return;

    this.fire('add', { item });
    this.fire('size');
  }

  protected _add(item: M) {
    this.items.add(item);
    this.index.set(item[this.itemKey], item);

    this.onItemAdd && this.onItemAdd(item);

    this.size += 1;
  }

  addRange(...items: M[]): void {
    this.addArr(items);
  }

  addArr(items: M[]): void {
    this.isBatching = true;

    for (const item of items) {
      this.add(item);
    }

    this.isBatching = false;

    this.fire('add.r', { items });
    this.fire('size');
  }

  remove(item?: M): void {
    if (!item) {
      this.clear();
      return;
    }

    if (!this.items.has(item)) {
      return;
    }

    this._remove(item);

    if (this.isBatching) return;

    this.fire('remove', { item });
    this.fire('size');
  }

  protected _remove(item: M) {
    this.items.delete(item);
    this.index.delete(item[this.itemKey]);

    this.onItemRemove && this.onItemRemove(item);

    this.size -= 1;
  }

  removeById(key: string): void {
    const item = this.index.get(key);
    if (item) {
      this.remove(item);
    } else {
      for (const item of this.items) {
        if (item[this.itemKey] === key) {
          this.remove(item);
        }
      }
    }
  }

  removeRange(...items: M[]): void {
    this.removeArr(items);
  }

  removeArr(items: M[]): void {
    this.isBatching = true;

    for (const item of items) {
      this.remove(item);
    }

    this.isBatching = false;

    this.fire('remove.r', { items });
    this.fire('size');
  }

  clear() {
    this._clear();
    this.fire('clear');
    this.fire('size');
  }

  protected _clear() {
    this.items.clear();
    this.index.clear();

    this.onClear && this.onClear();
    this.size = 0;
  }

  update(item: M): void {
    throw new Error('Method not implemented.');
  }

  updateRange(...items: M[]): void {
    throw new Error('Method not implemented.');
  }

  has(key: string | M): boolean {
    if (typeof key === 'string') {
      const item = this.index.get(key);
      if (!item) return false;
      return this.items.has(item);
    }

    return this.items.has(key);
  }

  find(key: string): M {
    const item = this.index.get(key);
    if (item) return item;
    for (const item of this.items) {
      if (item[this.itemKey] === key) {
        return item;
      }
    }
    return null;
  }

  query(predicate: (item: M) => boolean): M[] {
    const items = [];
    for (const item of this.items) {
      if (predicate(item)) {
        items.push(item);
      }
    }
    return items;
  }

  map<R>(project: (m: M) => R): R[] {
    const results = [];
    for (const item of this.items) {
      results.push(project(item));
    }
    return results;
  }

  filter(pipe: (m: M) => boolean): M[] {
    const result = [];
    for (const item of this.items) {
      if (!pipe || pipe(item)) result.push(item);
    }
    return result;
  }

  abstract create(...args: any[]): M;
  /**
   * key to item.
   */
  abstract itemKey: string;
}

export interface CoreList<M = any, E extends string = never> {
  onItemAdd(item: M): void;
  onItemRemove(item: M): void;
  onItemUpdate(item: M, data: any): void;
  onClear(): void;
}

// add,remove,update,add.r,remove.r,update.r
type CoreListEventType =
  | 'add'
  | 'remove'
  | 'update'
  | 'add.r'
  | 'remove.r'
  | 'update.r'
  | 'size'
  | 'clear';
