import { GraphicObject } from '../interfaces/GraghicObject';
import { ObjectType } from './ObjectType.enum';

export interface IWarehouse {
  mount(root: any): void;
  layout(data: unknown): void;

  each(fn: (item: GraphicObject, type: ObjectType) => void, type?: ObjectType): void;

  first(type: ObjectType): GraphicObject;
  item(type: ObjectType, id: string): GraphicObject;
  query(type: ObjectType, predicate: (item: unknown) => boolean): unknown[];
  add(type: ObjectType, item: GraphicObject): void;
  update(type: ObjectType, item: GraphicObject, data: any): void;
  remove(type: ObjectType, item: GraphicObject | string): void;

  onClick?(item: GraphicObject): void;
  onDblClick?(item: GraphicObject): void;
  onPress?(item: GraphicObject, evt: L.LeafletMouseEvent): void;
  onHover?(item: GraphicObject, on: boolean): void;
  onContextMenu?(item: GraphicObject, evt: L.LeafletMouseEvent): void;

  onAdd?(item: GraphicObject): void;
  onRemove?(item: GraphicObject): void;
  onUpdate?(item: GraphicObject, data: any): void;
}
