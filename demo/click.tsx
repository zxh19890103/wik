import L from 'leaflet';
import { Warehouse, basic, interactivateAllPanes, Bot } from '../2d';
import { Scene } from '../dom/Scene';
import { useState } from 'react';
import { injector, ModeManager, injectCtor } from '../model';
import { HrMap, VectorLayerList } from '../2d/basic';
import { IModeManager } from '../interfaces/symbols';

import './ioc.config';
import { SVG_KUBOT } from '../2d/images';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@injectCtor(IModeManager)
class MyWarehouse extends Warehouse<any, 'bot2'> {
  constructor(public readonly modeMgr: ModeManager) {
    super();
  }

  layout(data: any): void {
    // const point = new basic.Circle([0, 0], { radius: 3000, color: '#097' });
    // this.add('point', point);

    this.regTypeList('bot2', injector.$new(VectorLayerList, 'bot2', 'canvas'));

    const rect = new basic.Rectangle([0, 0], 8000, 1000, { opacity: 0.34, fillOpacity: 0.3 });
    injector.writeProp(rect, 'animationMgr', this.animationManager);

    this.add('bot2', rect);

    // const bot = injector.$new<Bot>(Bot, null, 1000, 1000);
    // this.add('bot', bot);

    const origin = L.marker([0, 0]);
    origin.addTo(this.map);
  }
}

export default () => {
  const [warehouse] = useState(() => {
    return injector.$new(MyWarehouse) as MyWarehouse;
  });

  const handleAfter = async (root: HrMap) => {
    interactivateAllPanes(root, warehouse.paneManager);

    await basic.setDefaultImage(Bot, SVG_KUBOT);
  };

  return <Scene warehouse={warehouse} afterMount={handleAfter} />;
};
