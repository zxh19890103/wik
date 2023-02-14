import React, { memo, useEffect, useState } from 'react';
import { IWarehouse, WikEvent } from '@/model';

interface Props {
  warehouse: IWarehouse;
}

const itemSetters: Set<React.Dispatch<any>> = new Set();
const itemsSetters: Set<React.Dispatch<any>> = new Set();

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

export const useMultipleSelection = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    itemsSetters.add(setItems);
    return () => {
      itemsSetters.delete(setItems);
    };
  }, []);

  return items as unknown;
};

export const SelectionContext = memo((props: Props) => {
  const { warehouse } = props;
  const selection = warehouse.selectionManager as any;

  useEffect(() => {
    const onItem = (event: WikEvent) => {
      const item = event.payload.item;
      for (const setter of itemSetters) {
        setter(item);
      }
    };

    const onItems = (event: WikEvent) => {
      const item = event.payload.items;
      for (const setter of itemsSetters) {
        setter(item);
      }
    };

    selection.on('item', onItem);
    selection.on('items', onItems);

    return () => {
      selection.off('item', onItem);
      selection.off('items', onItems);
    };
  }, [warehouse]);

  return null;
});
