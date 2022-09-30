import L from 'leaflet';
import { Warehouse, basic, DEFAULT_WAREHOUSE_DEPENDENCIES } from '../2d';
import { Scene } from '../dom/Scene';
import React, { useEffect, useMemo, useState } from 'react';
import { injectCtor, rootInjector, provides, View, IWarehouse, IList } from '../model';
import { IInjector } from '../interfaces/symbols';
import { Bot } from '../2d/Bot.class';

import './ioc.config';
import { SVG_KUBOT, SVG_KUBOT_RED } from '../2d/images';
import { render } from '../2d/renderer/layer';
import { VectorLayerList } from '../2d/basic';
import { GraphicObject } from '../interfaces/GraghicObject';
import { LayerWithID, WithLayerID } from '../interfaces/WithLayerID';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@injectCtor(IInjector)
@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
class MyWarehouse extends Warehouse {
  async layout(data: any) {
    const point = new basic.Circle([0, 0], { radius: 1000, color: '#097' });
    this.add('point', point);

    await this.imageManager.load(SVG_KUBOT, SVG_KUBOT_RED);

    const bot = this.injector.$new<Bot>(Bot, this.imageManager.get(SVG_KUBOT_RED), 1000, 1000);
    this.add('bot', bot);
  }
}

export default () => {
  const [warehouse] = useState(() => {
    return rootInjector.$new(MyWarehouse) as MyWarehouse;
  });

  render(<Stage warehouse={warehouse} />, null);

  return <Scene warehouse={warehouse} />;
};

interface WarehouseProps {
  model: IWarehouse;
}

const Warehouse007 = (props: React.PropsWithChildren<WarehouseProps>) => {
  useEffect(() => {
    // add
    return () => {
      // remove
    };
  }, []);

  return <>{props.children}</>;
};

interface ViewProps {
  model: WithLayerID;
}

const View = (props: ViewProps) => {
  useEffect(() => {
    // add
    return () => {
      // remove
    };
  }, []);
  return null;
};

interface ViewListProps {
  model: IList<GraphicObject>;
}

const ViewList = (props: ViewListProps) => {
  const { model } = props;

  useEffect(() => {
    // add
    console.log((model as any).pane);
    return () => {
      // remove
    };
  }, []);

  return (
    <>
      {model.map((m) => {
        const m2 = m as WithLayerID;
        return <View key={m2.layerId} model={m2} />;
      })}
    </>
  );
};

interface StageProps {
  warehouse: IWarehouse;
}

const Stage = (props: StageProps) => {
  const { warehouse } = props;
  const dataSets = useMemo(() => warehouse.getListAll(), []);

  return (
    <Warehouse007 model={warehouse}>
      {dataSets.map(({ type, value }) => {
        return <ViewList key={type} model={value} />;
      })}
    </Warehouse007>
  );
};
