import { Constructor, IInjector } from '@/interfaces';
import { CoreList, IWarehouse } from '@/model';
import { Base, IList, Model, View } from '@/model';

export interface ViewProps {
  parent: IList<View>;
  type: string;
  model: Model;
}

export interface ViewSetProps {
  /**
   * the type tag of objects.
   */
  type: string;
  /**
   * the data based on.
   */
  model: IList<Base>;
  /**
   * trigger component's re-render on which events?
   */
  reactOn?: string;
  filter?: `${string}=${string}` | ((m: any) => boolean);
}

export type MvMappings = Record<string, (m: any, warehouse: any) => any>;

export type WarehouseContextValue = {
  warehouse: IWarehouse;
  mvMappings: MvMappings;
};

export type WarehouseProvider =
  | IWarehouse
  | Constructor<IWarehouse>
  | ((injector: IInjector) => IWarehouse);

export interface WarehouseProps {
  warehouse: WarehouseProvider;
  mvMappings?: MvMappings;
  children?: JSX.Element | JSX.Element[];
  modes?: boolean;
}
