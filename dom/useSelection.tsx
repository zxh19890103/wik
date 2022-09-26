import React, { memo, useEffect, useState } from 'react';
import { IWarehouse } from '../model';
import { HrEvent } from '../model/basic/Event.class';
import { useEvented } from './useEvented';

interface Props {
  warehouse: IWarehouse;
}

const itemSetters: Set<React.Dispatch<any>> = new Set();

export const useSelection = () => {
  const [item, setItem] = useState(null);

  useEffect(() => {
    itemSetters.add(setItem);
    return () => {
      itemSetters.delete(setItem);
    };
  }, []);

  return item as unknown;
};

export const SelectionContext = memo((props: Props) => {
  const { warehouse } = props;
  const selection = warehouse.selectionManager as any;

  useEffect(() => {
    const onItem = (event: HrEvent) => {
      const item = event.payload.item;
      for (const setter of itemSetters) {
        setter(item);
      }
    };

    selection.on('item', onItem);

    return () => {
      selection.off('item', onItem);
    };
  }, [warehouse]);

  return null;
});
