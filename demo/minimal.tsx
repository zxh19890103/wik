import L from 'leaflet';
import { Warehouse, basic } from '../2d';
import { Scene } from '../dom/Scene';
import { useState } from 'react';
import { injector, ModeManager, injectCtor } from '../model';
import { IModeManager } from '../interfaces/symbols';
import { Bot } from '../2d/Bot.class';

import './ioc.config';
import { SVG_KUBOT, SVG_KUBOT_RED } from '../2d/images';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@injectCtor(IModeManager)
class MyWarehouse extends Warehouse {
  constructor(public readonly modeMgr: ModeManager) {
    super();
  }

  async layout(data: any) {
    const point = new basic.Circle([0, 0], { radius: 1000, color: '#097' });
    this.add('point', point);

    await this.imageManager.load(SVG_KUBOT, SVG_KUBOT_RED);

    const bot = injector.$new<Bot>(Bot, this.imageManager.get(SVG_KUBOT_RED), 1000, 1000);
    this.add('bot', bot);
  }
}

export default () => {
  const [warehouse] = useState(() => {
    return injector.$new(MyWarehouse) as MyWarehouse;
  });

  return <Scene warehouse={warehouse} afterMount={null} />;
};
