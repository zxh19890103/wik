import React, { useMemo } from 'react';
import { HrMap } from '../2d/basic';
import { PaneManager } from '../2d/state';
import { IWarehouse } from '../model';
import { View } from '../model/basic';

type WarehouseContextValue = {
  warehouse: IWarehouse;
  map: HrMap;
  paneMgr: PaneManager;
  modelViewMapping: Record<string, (m: any, warehouse: IWarehouse) => View<any>>;
};

const __warehouse_context__ = React.createContext<WarehouseContextValue>({
  warehouse: null,
  map: null,
  paneMgr: null,
  modelViewMapping: {},
});

interface WarehouseProps extends Partial<WarehouseContextValue> {
  children: JSX.Element | JSX.Element[];
}

export const Warehouse = (props: WarehouseProps) => {
  const contextValue = useMemo<WarehouseContextValue>(() => {
    return {
      warehouse: props.warehouse,
      paneMgr: props.paneMgr,
      modelViewMapping: props.modelViewMapping,
      map: props.map,
    };
  }, []);

  return (
    <__warehouse_context__.Provider value={contextValue}>
      {props.children}
    </__warehouse_context__.Provider>
  );
};

Warehouse.context = __warehouse_context__;
