import { GraphicObject } from '../interfaces/GraghicObject';
import { ObjectType } from './ObjectType.enum';

export interface IWarehouse {
  mount(root: any): void;
  layout(data: unknown): void;

  each(fn: (item: GraphicObject, type: string) => void, type?: string): void;

  first<M extends GraphicObject>(type: string): M;
  item(type: string, id: string): GraphicObject;
  query(type: string, predicate: (item: unknown) => boolean): unknown[];
  add(type: string, item: GraphicObject): void;
  update(type: string, item: GraphicObject, data: any): void;
  remove(type: string, item: GraphicObject | string): void;

  onClick?(item: GraphicObject): void;
  onDblClick?(item: GraphicObject): void;
  onPress?(item: GraphicObject, evt: L.LeafletMouseEvent): void;
  onHover?(item: GraphicObject, on: boolean): void;
  onContextMenu?(item: GraphicObject, evt: L.LeafletMouseEvent): void;

  onAdd?(item: GraphicObject): void;
  onRemove?(item: GraphicObject): void;
  onUpdate?(item: GraphicObject, data: any): void;
}
