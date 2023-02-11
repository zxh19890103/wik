import { memo, useContext, useEffect } from 'react';
import { ViewProps } from './interface';
import { __warehouse_context__ } from './WarehouseContext';

export const View = memo(
  (props: ViewProps) => {
    const { parent, model, type } = props;
    const { warehouse, mvMappings } = useContext(__warehouse_context__);

    useEffect(() => {
      const makeFn = mvMappings[type];

      const view = makeFn ? makeFn(model, warehouse) : parent.create(model);

      const index = model.$$views.push(view) - 1;
      view.model = model;

      warehouse.add(type, view);
      view.whenInit && view.whenInit();

      return () => {
        model.$$views.splice(index, 1);
        view.model = null;

        view.whenUnInit && view.whenUnInit();
        warehouse.remove(type, view);
      };
    }, []);

    return null;
  },
  () => true,
);
