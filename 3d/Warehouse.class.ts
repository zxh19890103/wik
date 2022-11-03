import { GraphicObject } from '../interfaces/GraghicObject';
import { IInjector } from '../interfaces/Injector';
import { IModeManager } from '../interfaces/Mode';
import { ISelectionManager } from '../interfaces/Selection';
import { IWarehouse } from '../model';
import { Core, IList, writeReadonlyProp } from '../model/basic';
import { Object3DList } from './Object3DList.class';

export abstract class Warehouse3D extends Core implements IWarehouse {
  readonly mounted: boolean = false;
  readonly layouted: boolean = false;

  protected readonly scene: THREE.Scene;

  readonly selectionManager: ISelectionManager;
  readonly modeManager: IModeManager;
  readonly typedLists: Map<string, Object3DList<THREE.Object3D>> = new Map();

  abstract layout(data?: unknown): void | Promise<void>;

  mount(root: THREE.Scene): void {
    if (this.mounted) return;

    writeReadonlyProp(this, 'scene', root);
    writeReadonlyProp(this, 'mounted', true);

    for (const [_, list] of this.typedLists) {
      if (list.mounted) continue;
      list.mount(root);
    }

    (async () => {
      await this.layout(null);
      writeReadonlyProp(this, 'layouted', true);
    })();
  }

  queryListAll(): { type: string; value: IList<GraphicObject> }[] {
    throw new Error('Method not implemented.');
  }

  queryList(type: string): IList<GraphicObject> {
    throw new Error('Method not implemented.');
  }

  addList<O extends THREE.Object3D>(type: string): Object3DList<O> {
    if (this.typedLists.has(type)) return;
    const list = this.injector.$new<Object3DList<O>>(Object3DList);
    this.typedLists.set(type, list);

    this.setEventChild(list);

    if (this.mounted) list.mount(this.scene);

    return list;
  }

  removeList(type: string): void {
    throw new Error('Method not implemented.');
  }

  each(fn: (item: GraphicObject, type: string) => void, type?: string): void {
    throw new Error('Method not implemented.');
  }

  first<M extends GraphicObject>(type: string): M {
    throw new Error('Method not implemented.');
  }

  item(type: string, id: string): GraphicObject {
    throw new Error('Method not implemented.');
  }

  query(type: string, predicate: (item: unknown) => boolean): unknown[] {
    throw new Error('Method not implemented.');
  }

  add(type: string, item: GraphicObject): void {
    throw new Error('Method not implemented.');
  }

  update(type: string, item: GraphicObject, data: any): void {
    throw new Error('Method not implemented.');
  }

  remove(type: string, item: string | GraphicObject): void {
    throw new Error('Method not implemented.');
  }

  injector: IInjector;

  [Symbol.iterator](): Iterator<GraphicObject, any, undefined> {
    throw new Error('Method not implemented.');
  }
}
