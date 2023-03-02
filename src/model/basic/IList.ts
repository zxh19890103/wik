import { Constructor } from '@/interfaces';

export interface IList<M extends object> extends Iterable<M> {
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
  query(predicate: (item: M) => boolean): M[];
  map<R>(project: (item: M) => R): R[];
  filter(pipe: (m: M) => boolean): M[];
  /**
   * 创建一个默认的对象，并且将其添加至数据集
   */
  create(...args: ConstructorParameters<Constructor<M>>): M;
}
