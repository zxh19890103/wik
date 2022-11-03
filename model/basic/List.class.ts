import { Constructor, ConstructorOrFactory, Factory } from '../../interfaces/Constructor';
import { Serializable } from '../../interfaces/Serializable';
import { isClass } from '../../utils';
import { Base } from './Base.class';
import { CoreList } from './Core.class';

/**
 *
 * List for holding Base.
 * events:
 * add,remove,update,add.r,remove.r,update.r
 */
export class List<M extends Base> extends CoreList<M> implements Serializable {
  readonly itemKey: string = 'id';
  private itemC: ConstructorOrFactory<M> = null;

  *[Symbol.iterator]() {
    for (const item of this.items) {
      yield item;
    }
  }

  constructor(C: ConstructorOrFactory<M>, items: M[]) {
    super(items);
    this.itemC = C;
  }

  fromJSON(data: any[]): this {
    throw new Error('Method not implemented.');
  }

  toJSON() {
    throw new Error('Method not implemented.');
  }

  override _add(item: M): void {
    this.setEventChild(item);
    super._add(item);
  }

  override _remove(item: M): void {
    this.setEventChild(item, true);
    super._remove(item);
  }

  override _clear(): void {
    for (const item of this.items) {
      this.setEventChild(item, true);
    }
    super._clear();
  }

  create(...args: any[]): M {
    let m: M;

    if (isClass(this.itemC)) {
      m = new (this.itemC as Constructor<M>)(...args);
    } else {
      m = (this.itemC as Factory<M>)(...args);
    }

    this.add(m);
    return m;
  }
}
