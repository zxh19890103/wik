import { memo, useContext, useEffect, useMemo, useState } from 'react';
import { LayerList } from '../../2d/basic';
import { LayerWithID } from '../../interfaces/WithLayerID';
import { Base, IList } from '../../model/basic';
import { useEvented } from '../useEvented';
import { View } from './View';
import { __warehouse_context__ } from './Warehouse';

interface ViewSetProps {
  type: string;
  model: IList<Base>;
  reactOn?: string;
  filter?: `${string}=${string}` | ((m: any) => boolean);
}

interface ViewSet2DProps extends ViewSetProps {
  renderer: 'canvas' | 'svg' | 'overlay';
  fit?: boolean;
  /**
   * should be in range of 401 - 599
   * If the pane is for svgOverlay, [500 - 599
   * If the pane is for canvas or svg vector, range is 401 - 500)
   */
  z?: number;
}

export const ViewSet = memo(
  (props: ViewSet2DProps) => {
    const { model, renderer, type } = props;
    const { warehouse } = useContext(__warehouse_context__);

    useEvented(model, `size ${props.reactOn}`);

    const [viewSet] = useState(() => {
      let list: IList<any>;

      list = warehouse.queryList(type);
      if (list) return list;

      list = warehouse.addList(type, {
        rendererBy: renderer,
        pane: `${type}Pane`,
      });

      if (props.z !== undefined) {
        (list as LayerList<LayerWithID>).setZ(props.z);
      }

      return list;
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

interface ViewSet3DProps extends ViewSetProps {}

export const ViewSet3D = memo((props: ViewSet3DProps) => {
  const { model, type } = props;
  const { warehouse } = useContext(__warehouse_context__);

  useEvented(model, `size ${props.reactOn}`);

  const [viewSet] = useState(() => {
    let list: IList<any>;

    list = warehouse.queryList(type);
    if (list) return list;

    list = warehouse.addList(type);

    return list;
  });

  useEffect(() => {
    return () => {
      warehouse.removeList(type);
    };
  }, []);

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
});
