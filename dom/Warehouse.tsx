import React, { useMemo, useState } from 'react';
import { IWarehouse } from '../model';

type WarehouseContextValue = {
  warehouse: IWarehouse;
};

const __warehouse_context__ = React.createContext<WarehouseContextValue>({
  warehouse: null,
});

interface WarehouseProps {
  warehouse: IWarehouse;
  children: JSX.Element | JSX.Element[];
}

export const Warehouse = (props: WarehouseProps) => {
  const ctxValue = useMemo(() => {
    return { warehouse: props.warehouse };
  }, []);

  return (
    <__warehouse_context__.Provider value={ctxValue}>
      {props.children}
    </__warehouse_context__.Provider>
  );
};

Warehouse.context = __warehouse_context__;
