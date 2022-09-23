import L from 'leaflet';
import { Warehouse, Route } from '../2d';
import { Scene } from '../dom/Scene';
import { useState } from 'react';
import { injector, ModeManager, injectCtor } from '../model';
import { HrMap } from '../2d/basic';
import { IModeManager } from '../interfaces/symbols';

import './ioc.config';
import { randomLatLng } from '../utils';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@injectCtor(IModeManager)
class MyWarehouse extends Warehouse<any, 'routes'> {
  constructor(public readonly modeMgr: ModeManager) {
    super();
  }

  async layout(data: any) {
    this.addLayerList('routes', { pane: 'routesPane', rendererBy: 'canvas' });

    const route = new Route([], {});

    for (let r = 0; r < 3; r++) {
      route
        .M(randomLatLng(10000))
        .L(randomLatLng(10000))
        .B(randomLatLng(10000), randomLatLng(10000), randomLatLng(10000))
        .F();
    }

    this.add('routes', route);
  }
}

export default () => {
  const [warehouse] = useState(() => {
    return injector.$new(MyWarehouse) as MyWarehouse;
  });

  const handleAfter = (root: HrMap) => {};

  return <Scene warehouse={warehouse} afterMount={handleAfter} />;
};
