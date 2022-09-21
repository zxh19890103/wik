import L from 'leaflet';
import { Warehouse, Route } from '../2d';
import { Scene } from '../dom/Scene';
import { useState } from 'react';
import { injector } from '../model';
import { HrMap } from '../2d/basic';

import './ioc.config';
import { randomLatLng } from '../utils';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

class MyWarehouse extends Warehouse<any, 'routes'> {
  async layout(data: any) {
    this.regTypeList('routes', { pane: 'routesPane', rendererBy: 'canvas' });

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

class MyWarehouse2 extends Warehouse<any, 'routes'> {
  async layout(data: any) {
    this.regTypeList('routes', { pane: 'routesPane', rendererBy: 'canvas' });

    const route = new Route([], {});

    for (let r = 0; r < 5; r++) {
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
  const [warehouses] = useState(() => {
    return [injector.$new(MyWarehouse) as MyWarehouse, injector.$new(MyWarehouse2) as MyWarehouse];
  });

  const handleAfter = (root: HrMap) => {};
  const [wh0, wh1] = warehouses;

  return (
    <div>
      <Scene warehouse={wh0} afterMount={handleAfter} />
      {/* <Scene warehouse={wh1} afterMount={handleAfter} /> */}
    </div>
  );
};
