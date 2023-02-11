import { WithParent } from '../interfaces/WithParent';
import { IWarehouse } from './IWarehouse';

export interface IWarehouseObjectList extends WithParent<IWarehouse> {
  readonly scene: unknown;
  readonly mounted: boolean;
  mount(root: unknown): void;
  unmount(): void;
}

export interface WithWarehouseRef<W = IWarehouse> {
  $$warehouse: W;
}
