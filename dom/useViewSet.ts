import { useContext, useEffect, useMemo } from 'react';
import { ViewSetProps } from './interface';
import { useEvented } from './useEvented';
import { __warehouse_context__ } from './WarehouseContext';

interface UseViewSetOptions extends ViewSetProps {}

/**
 * share the same logic
 */
export const useViewSet = (options: UseViewSetOptions) => {
  const { model, reactOn, type, filter } = options;
  const { warehouse } = useContext(__warehouse_context__);

  useEvented(model, `size ${reactOn}`);

  const pipe = useMemo(() => {
    if (!filter) return null;

    if (typeof filter === 'string') {
      const [name, value] = filter.split(/=/);
      return (m: any) => {
        return String(m[name]) === value;
      };
    }

    return filter;
  }, [filter]);

  useEffect(() => {
    return () => {
      warehouse.removeList(type);
    };
  }, []);

  const items = pipe ? model.filter(pipe) : model;

  return {
    items,
  };
};
