import { Constructor } from '../../interfaces/Constructor';
import { Base, View, ViewContainer } from './Base.class';

export interface IList<M> extends Iterable<M> {
  items: Set<M>;
  index: Map<string, M>;
  size: number;
  /**
   * 将一个对象加入到数据集，标记为 Added，将在下次提交时远程添加
   */
  add(item: M): void;
  addRange(...items: M[]): void;
  addArr(items: M[]): void;

  /**
   * 将对象从数据集移除，并将其标记为 Deleted，将在下次提交时远程删除
   *
   * Warn！ 当不传 item 的时候，表示移除全部元素
   */
  remove(item?: M): void;
  removeById(id: string): void;
  removeRange(...items: M[]): void;
  removeArr(items: M[]): void;
  clear(): void;

  /**
   * 将对象标记为 Modified，将在下次提交时更新对应的远程对象
   */
  update(item: M): void;
  updateRange(...items: M[]): void;

  /**
   * 查询
   */
  has(key: string | M): boolean;
  find(key: string): M;
  map<R>(project: (item: M) => R): R[];
  query(predicate: (item: M) => boolean): M[];
  /**
   * 创建一个默认的对象，并且将其添加至数据集
   */
  create(...args: any[]): M;
}

/**
 * events:
 * add,remove,update,add.r,remove.r,update.r
 */
export class List<M extends Base> extends Base implements IList<M> {
  items: Set<M> = new Set();
  index: Map<string, M> = new Map();
  size = 0;
  private item_C: Constructor<M> = null;
  private view_containers: ViewContainer<M, View<M>>[] = [];
  private isBatching = false;

  *[Symbol.iterator]() {
    for (const item of this.items) {
      yield item;
    }
  }

  constructor(C: Constructor<M>, items: M[]) {
    super();
    this.item_C = C;
    this.addRange(...items);
  }

  fromJSON(data: any[]): this {
    for (const d of data) {
      const m = new this.item_C().fromJSON(d);
      this.add(m);
    }
    return this;
  }

  toJSON() {
    throw new Error('Method not implemented.');
  }

  toSnapshot() {
    return null;
  }

  add(item: M): void {
    this.items.add(item);
    this.index.set(item.id, item);

    this.setEventChild(item);

    this.size += 1;

    if (this.isBatching) return;

    for (const c of this.view_containers) {
      c.add(c.$$make(item));
    }

    this.emit('add', { item });
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

    for (const c of this.view_containers) {
      c.add(...items.map(c.$$make));
    }

    this.emit('add.r', { items });
  }

  remove(item?: M): void {
    if (!item) {
      this.clear();
      return;
    }

    if (!this.items.has(item)) {
      return;
    }

    this.items.delete(item);
    this.index.delete(item.id);

    this.setEventChild(item, true);

    this.size -= 1;

    item.reqEffectCall('Trash');

    if (this.isBatching) return;

    this.emit('remove', { item });
  }

  removeById(key: string): void {
    const item = this.index.get(key);
    if (item) {
      this.remove(item);
    } else {
      for (const item of this.items) {
        if (item.id === key) {
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

    this.emit('remove.r', { items });
  }

  clear() {
    for (const item of this.items) {
      this.setEventChild(item, true);
    }

    this.items.clear();
    this.index.clear();
    this.size = 0;

    this.emit('clear', null);
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
      if (item.id === key) {
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

  create(...args: any[]): M {
    const m = new this.item_C(...args);
    this.add(m);
    return m;
  }
}
