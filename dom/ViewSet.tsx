import { memo, useContext, useEffect, useMemo, useState } from 'react';
import { LayerList, VectorLayerList } from '../2d/basic';
import { LayerWithID } from '../interfaces/WithLayerID';
import { Base, IList } from '../model/basic';
import { useEvented } from './useEvented';
import { View } from './View';
import { Warehouse } from './Warehouse';

interface ViewListProps {
  renderer: 'canvas' | 'svg' | 'overlay';
  type: string;
  model: IList<Base>;
  reactOn?: string;
  filter?: `${string}=${string}` | ((m: any) => boolean);
  fit?: boolean;
  /**
   * should be in range of 401 - 599
   * If the pane is for svgOverlay, [500 - 599
   * If the pane is for canvas or svg vector, range is 401 - 500)
   */
  zIndex?: number;
}

export const ViewSet = memo(
  (props: ViewListProps) => {
    const { model, renderer, type } = props;
    const { warehouse } = useContext(Warehouse.context);

    useEvented(model, `size ${props.reactOn}`);

    const [viewSet] = useState(() => {
      const vs = warehouse.addList(type, {
        rendererBy: renderer,
        pane: `${type}Pane`,
      });

      if (props.zIndex !== undefined) {
        (vs as LayerList<LayerWithID>).setZ(props.zIndex);
      }

      return vs;
    });

    useEffect(() => {
      return () => {
        warehouse.removeList(type);
      };
    }, []);

    useEffect(() => {
      if (props.fit) {
        (viewSet as LayerList<LayerWithID>).fit();
      }
    }, [model.size]);

    const pipe = useMemo(() => {
      if (!props.filter) return null;

      if (typeof props.filter === 'string') {
        const [name, value] = props.filter.split(/=/);
        return (m: any) => {
          return String(m[name]) === value;
        };
      }

      return props.filter;
    }, []);

    const items = pipe ? model.filter(pipe) : model;

    return (
      <>
        {items.map((m) => {
          return <View key={m.id} type={type} parent={viewSet} model={m} />;
        })}
      </>
    );
  },
  () => true,
);
