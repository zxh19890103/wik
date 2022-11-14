import { memo, useContext, useEffect, useMemo, useState } from 'react';
import { LayerList } from '../../2d/basic';
import { InstancedMesh } from '../../3d/basic';
import { LayerWithID } from '../../interfaces/WithLayerID';
import { Base, IList } from '../../model/basic';
import { useEvented } from '../useEvented';
import { InstancedView, View } from './View';
import { __warehouse_context__ } from './Warehouse';

interface ViewSetProps {
  /**
   * the type tag of objects.
   */
  type: string;
  /**
   * the data based on.
   */
  model: IList<Base>;
  /**
   * trigger component's re-render on which events?
   */
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

    // fit
    useEffect(() => {
      if (props.fit) {
        setTimeout(() => {
          (viewSet as LayerList<LayerWithID>).fit();
        }, 300);
      }
    }, [model.size]);

    const { items } = useViewSet(props);

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
  const { type } = props;
  const { warehouse, mvMappings } = useContext(__warehouse_context__);

  const [viewSet] = useState(() => {
    let list: IList<any>;

    list = warehouse.queryList(type);
    if (list) return list;

    list = warehouse.addList(type);

    return list;
  });

  const { items } = useViewSet(props);

  return (
    <>
      {items.map((m) => {
        return <View key={m.id} type={type} parent={viewSet} model={m} />;
      })}
    </>
  );
});

interface InstancedViewSet3DProps extends ViewSetProps {}
export const InstancedViewSet3D = memo((props: InstancedViewSet3DProps) => {
  const { type } = props;
  const { warehouse, mvMappings } = useContext(__warehouse_context__);
  const [instView, setInstView] = useState<InstancedMesh>(null);

  const [viewSet] = useState(() => {
    let list: IList<any>;

    list = warehouse.queryList(type);
    if (list) return list;

    list = warehouse.addList(type);

    return list;
  });

  useEffect(() => {
    const make = mvMappings[type];

    const instancedView = make(props.model, warehouse);

    warehouse.add(type, instancedView);

    setInstView(instancedView);

    return () => {
      warehouse.remove(type, instancedView);
    };
  }, []);

  const { items } = useViewSet(props);

  if (!instView) return null;

  return (
    <>
      {items.map((m) => {
        return (
          <InstancedView instanced={instView} key={m.id} type={type} parent={viewSet} model={m} />
        );
      })}
    </>
  );
});

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
