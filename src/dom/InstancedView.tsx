import { memo, useContext, useEffect } from 'react';
import { type InstancedMesh } from '@/3d/basic';
import { ViewProps } from './interface';
import { __warehouse_context__ } from './WarehouseContext';

interface InstancedViewProps extends ViewProps {
  instanced: InstancedMesh;
}

export const InstancedView = memo((props: InstancedViewProps) => {
  const { parent, model, type, instanced } = props;
  const { warehouse, mvMappings } = useContext(__warehouse_context__);

  useEffect(() => {
    const makeFn = mvMappings[type];

    const { position, color } = makeFn(model, warehouse);

    return () => {};
  }, []);

  return null;
});
