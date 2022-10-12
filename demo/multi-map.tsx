import L from 'leaflet';
import { Warehouse, Route, basic, Bot, DEFAULT_WAREHOUSE_DEPENDENCIES } from '../2d';
import { Scene } from '../dom/Scene';
import { useState } from 'react';
import { inject, provides, rootInjector } from '../model/basic';
import * as Interfaces from '../interfaces/symbols';

import './ioc.config';
import { randomLatLng } from '../utils';
import { SVG_KUBOT } from '../2d/images';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@inject(Interfaces.IInjector)
@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
class MyWarehouse extends Warehouse<any, 'routes'> {
  async layout(data: any) {
    this.addList('routes', { pane: 'routesPane', rendererBy: 'canvas' });

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

@inject(Interfaces.IInjector)
@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
class MyWarehouse2 extends Warehouse<any, 'routes'> {
  async layout(data: any) {
    await this.imageManager.load(SVG_KUBOT);

    this.addList('routes', { pane: 'routesPane', rendererBy: 'canvas' });

    const route = new Route([], {});
    const bot = this.injector.$new<Bot>(Bot, this.imageManager.get(SVG_KUBOT), 1000, 1000);

    for (let r = 0; r < 5; r++) {
      route
        .M(randomLatLng(10000))
        .L(randomLatLng(10000))
        .B(randomLatLng(10000), randomLatLng(10000), randomLatLng(10000))
        .F();
    }

    this.add('routes', route);
    this.add('bot', bot);
  }
}

export default () => {
  const [warehouses] = useState(() => {
    return [
      rootInjector.$new(MyWarehouse) as MyWarehouse,
      rootInjector.$new(MyWarehouse2) as MyWarehouse,
    ];
  });

  const [wh0, wh1] = warehouses;

  return (
    <Scene.Layout flow="horizontal" w="100vw" h="100vh">
      <Scene w="50%" h="100%" border warehouse={wh0} />
      <Scene w="50%" h="100%" border warehouse={wh1} />
    </Scene.Layout>
  );
};
