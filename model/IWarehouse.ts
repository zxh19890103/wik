import { GraphicObject } from '../interfaces/GraghicObject';
import { WithInjector } from '../interfaces/Injector';
import { IModeManager } from '../interfaces/Mode';
import { ISelectionManager } from '../interfaces/Selection';
import { IList } from './basic';

export interface IWarehouse extends WithInjector, Iterable<GraphicObject> {
  selectionManager: ISelectionManager;
  modeManager: IModeManager;

  mount(root: any): void;
  layout(data?: unknown): void | Promise<void>;

  queryListAll(): Array<{ type: string; value: IList<GraphicObject> }>;
  queryList(type: string): IList<GraphicObject>;
  addList(type: string, list: ListCtorArgs): IList<any>;
  removeList(type: string): void;

  each(fn: (item: GraphicObject, type: string) => void, type?: string): void;

  first<M extends GraphicObject>(type: string): M;
  item(type: string, id: string): GraphicObject;
  query(type: string, predicate: (item: unknown) => boolean): unknown[];
  add(type: string, item: GraphicObject): void;
  update(type: string, item: GraphicObject, data: any): void;
  remove(type: string, item: GraphicObject | string): void;

  onClick?(item: GraphicObject, evt: L.LeafletMouseEvent): void;
  onDblClick?(item: GraphicObject, evt: L.LeafletMouseEvent): void;
  onPress?(item: GraphicObject, evt: L.LeafletMouseEvent): void;
  onHover?(item: GraphicObject, evt: L.LeafletMouseEvent): void;
  onUnHover?(item: GraphicObject, evt: L.LeafletMouseEvent): void;
  onContextMenu?(item: GraphicObject, evt: L.LeafletMouseEvent): void;
  onMounted?(): void;
  onLayouted?(): void;

  onAdd?(item: GraphicObject): void;
  onRemove?(item: GraphicObject): void;
  onUpdate?(item: GraphicObject, data: any): void;
}

export type ListCtorArgs = {
  pane: string;
  rendererBy?: 'canvas' | 'svg' | 'overlay';
};
