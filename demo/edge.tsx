import L from 'leaflet';
import { EssWarehouse, Edge } from '../2d';
import { Scene } from '../dom/Scene';
import { useState } from 'react';
import { rootInjector } from '../model/basic';

import './ioc.config';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

class MyWarehouse extends EssWarehouse {
  async layout(data: any) {
    const edge = new Edge().move([0, 0]).forwards([-8002, 3400], [1200, 9091], [0, 1000]);
    // const edge = new Edge().move([0, 0]).forwards([-8002, 3400]);
    this.add('shelf', edge);
  }
}

export default () => {
  const [warehouse] = useState(() => {
    return rootInjector.$new(MyWarehouse) as MyWarehouse;
  });

  return <Scene warehouse={warehouse} />;
};
