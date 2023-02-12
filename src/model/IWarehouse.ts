import { GraphicObject } from '../interfaces/GraghicObject';
import { WithInjector } from '../interfaces/Injector';
import { IBehavior, IModeManager } from '../interfaces/Mode';
import { ISelectionManager } from '../interfaces/Selection';
import { IList } from './basic';

export interface IWarehouse
  extends WithInjector,
    Iterable<GraphicObject>,
    Partial<IWarehouseOptional> {
  selectionManager: ISelectionManager;
  modeManager: IModeManager;

  mounted: boolean;
  layouted: boolean;

  mount(root: unknown, ...args: any[]): void;
  layout(data?: unknown): void | Promise<void>;

  queryListAll(): Array<{ type: string; value: IList<GraphicObject> }>;
  queryList(type: string): IList<GraphicObject>;
  addList(type: string, list?: ListCtorArgs): IList<any>;
  removeList(type: string): void;

  each(fn: (item: GraphicObject, type: string) => void, type?: string): void;

  first<M extends GraphicObject>(type: string): M;
  item(type: string, id: string): GraphicObject;
  query(type: string, predicate: (item: unknown) => boolean): unknown[];
  add(type: string, item: GraphicObject): void;
  update(type: string, item: GraphicObject, data: any): void;
  remove(type: string, item: GraphicObject | string): void;

  getLayoutData(): Promise<unknown>;
  configModes(): Record<string, IBehavior[]>;
}

export interface IWarehouseOptional {
  onClick(item: GraphicObject, evt: unknown): void;
  onDblClick(item: GraphicObject, evt: unknown): void;
  onPress(item: GraphicObject, evt: unknown): void;
  onHover(item: GraphicObject, evt: unknown): void;
  onUnHover(item: GraphicObject, evt: unknown): void;
  onContextMenu(item: GraphicObject, evt: unknown): void;
  onMounted(): void;
  onLayouted(): void;

  onAdd(item: GraphicObject): void;
  onRemove(item: GraphicObject): void;
  onUpdate(item: GraphicObject, data: any): void;

  /**
   * every frame call
   */
  onTick(): void;
}

/**
 * for threejs pane is useless rendererBy must be canvas.
 */
export type ListCtorArgs = {
  pane: string;
  rendererBy?: 'canvas' | 'svg' | 'overlay';
};