import { GraphicObject } from '../interfaces/GraghicObject';
import { IInjector } from '../interfaces/Injector';
import { IModeManager } from '../interfaces/Mode';
import { ISelectionManager } from '../interfaces/Selection';
import { IWarehouse, ListCtorArgs } from '../model';
import { IList } from '../model/basic';

export abstract class Warehouse3D implements IWarehouse {
  protected readonly scene: THREE.Scene;

  selectionManager: ISelectionManager;
  modeManager: IModeManager;

  abstract layout(data?: unknown): void | Promise<void>;

  mount(root: THREE.Scene): void {
    this.injector.writeProp(this, 'scene', root);
    this.layout(null);
  }

  queryListAll(): { type: string; value: IList<GraphicObject> }[] {
    throw new Error('Method not implemented.');
  }

  queryList(type: string): IList<GraphicObject> {
    throw new Error('Method not implemented.');
  }

  addList(type: string, list: ListCtorArgs): IList<any> {
    throw new Error('Method not implemented.');
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
