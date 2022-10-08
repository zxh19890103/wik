import { memo, useContext, useEffect } from 'react';
import { IList, Model, View as ModelView } from '../model';
import { Warehouse } from './Warehouse';

interface Props {
  parent: IList<ModelView>;
  type: string;
  model: Model;
}

export const View = memo(
  (props: Props) => {
    const { warehouse, modelViewMapping } = useContext(Warehouse.context);
    const { parent, model, type } = props;

    useEffect(() => {
      const makeFn = modelViewMapping[type];

      const view = makeFn ? makeFn(model, warehouse) : parent.create(model);

      const index = model.$$views.push(view) - 1;
      view.model = model;

      view.whenInit && view.whenInit();
      warehouse.add(type, view);

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
