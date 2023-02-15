import React from 'react';
import { IInjector } from '@/interfaces';
import { WarehouseContextValue, WarehouseProvider } from './interface';

export const __context_value__ = Object.freeze({
  warehouse: null,
  mvMappings: null,
});

export const __warehouse_context__ = React.createContext<WarehouseContextValue>(__context_value__);

export const createWarehouse = (injector: IInjector, model: WarehouseProvider) => {
  if (typeof model === 'function') {
    return model(injector);
  } else {
    return model;
  }
};

export const whStyle = { width: '100%', height: '100%' };
