import React, { useContext, useEffect, useRef, useState } from 'react';
import { WikMap } from '@/2d';
import { SelectionContext } from './useSelection';
import { Modes } from './Select';
import { __world_context__ } from './World';
import { WarehouseContextValue, WarehouseProps } from './interface';
import {
  createWarehouse,
  whStyle,
  __context_value__,
  __warehouse_context__,
} from './WarehouseContext';

/**
 * 2d warehouse
 */
export const Warehouse = (props: WarehouseProps) => {
  const element = useRef<HTMLDivElement>();

  const [value, setValue] = useState<WarehouseContextValue>({
    ...__context_value__,
    mvMappings: props.mvMappings,
  });

  const { injector } = useContext(__world_context__);

  useEffect(() => {
    const root = new WikMap(element.current);
    const warehouse = createWarehouse(injector, props.warehouse);
    warehouse?.mount(root);
    setValue({ ...value, warehouse });
  }, []);

  const { warehouse } = value;

  return (
    <__warehouse_context__.Provider value={value}>
      <div style={whStyle} className="wik-warehouse" ref={element}>
        {warehouse && (
          <>
            <SelectionContext warehouse={warehouse} />
            {props.modes && <Modes warehouse={warehouse} />}
            {React.Children.map(props.children, (child) => {
              return <child.type {...child.props} parent={warehouse} />;
            })}
          </>
        )}
      </div>
    </__warehouse_context__.Provider>
  );
};
