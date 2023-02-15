import { memo, useContext, useEffect, useState } from 'react';
import { LayerList } from '@/2d';
import { LayerWithID } from '@/interfaces';
import { IList } from '@/model';
import { ViewSetProps } from './interface';
import { useViewSet } from './useViewSet';
import { View } from './View';
import { __warehouse_context__ } from './WarehouseContext';

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
