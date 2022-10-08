import { AnyObject } from '../interfaces/types';
import { Warehouse } from './Warehouse.class';

export class EssWarehouse<LayoutData = AnyObject, OType extends string = never> extends Warehouse<
  LayoutData,
  OType
> {
  layout(data?: LayoutData): void | Promise<void> {}
}
