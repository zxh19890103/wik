import { memo, useContext, useEffect, useState } from 'react';
import { InstancedMesh } from '@/3d/basic';
import { IList } from '@/model';
import { InstancedView } from './InstancedView';
import { ViewSetProps } from './interface';
import { useViewSet } from './useViewSet';
import { View } from './View';
import { __warehouse_context__ } from './WarehouseContext';

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
