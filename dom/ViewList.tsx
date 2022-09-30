import { useContext, useEffect } from 'react';
import { IList, List } from '../model';
import { View } from './View';
import { Warehouse } from './Warehouse';

interface ViewListProps {
  renderer: 'canvas' | 'svg' | 'overlay';
  type: string;
  model: List<any>;
}

export const ViewList = (props: ViewListProps) => {
  const { model, renderer, type } = props;
  const { warehouse } = useContext(Warehouse.context);

  useEffect(() => {
    warehouse.addList(type, { rendererBy: renderer, pane: `${type}Pane` });
    return () => {};
  }, []);

  return (
    <>
      {model.map((m) => {
        return <View />;
      })}
    </>
  );
};
