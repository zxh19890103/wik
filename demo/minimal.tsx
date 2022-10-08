import L from 'leaflet';
import { Warehouse, basic, DEFAULT_WAREHOUSE_DEPENDENCIES } from '../2d';
import { Scene } from '../dom/Scene';
import { useState } from 'react';
import { inject, rootInjector, provides } from '../model';
import { IInjector } from '../interfaces/symbols';
import { Bot } from '../2d/Bot.class';

import './ioc.config';
import { SVG_KUBOT, SVG_KUBOT_RED } from '../2d/images';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@inject(IInjector)
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

  return <Scene warehouse={warehouse} />;
};
