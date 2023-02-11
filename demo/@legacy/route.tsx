import L from 'leaflet';
import { EssWarehouse, Route } from '../../2d';
import { Scene } from '../dom/Scene';
import { useState } from 'react';
import { rootInjector, inject } from '../../model/basic';
import { IInjector } from '../../interfaces/symbols';

import '../ioc.config';
import { randomLatLng } from '../../utils';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@inject(IInjector)
class MyWarehouse extends EssWarehouse<any, 'routes'> {
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

export default () => {
  const [warehouse] = useState(() => {
    return rootInjector.$new(MyWarehouse) as MyWarehouse;
  });

  return <Scene warehouse={warehouse} />;
};
