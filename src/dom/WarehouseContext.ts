import React from 'react';
import { Constructor, IInjector } from '@/interfaces';
import { WarehouseContextValue, WarehouseProvider } from './interface';
import { isArrowFunction } from '@/utils';

export const __context_value__ = Object.freeze({
  warehouse: null,
  mvMappings: null,
});

export const __warehouse_context__ = React.createContext<WarehouseContextValue>(__context_value__);

export const createWarehouse = (injector: IInjector, model: WarehouseProvider) => {
  if (typeof model === 'function') {
    if (isArrowFunction(model)) {
      return (model as any)(injector);
    } else {
      return injector.$new(model as Constructor);
    }
  } else {
    return model;
  }
};

export const whStyle = { width: '100%', height: '100%' };
