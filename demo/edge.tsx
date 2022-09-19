import L from 'leaflet';
import { Warehouse, basic, interactivateAllPanes, Edge } from '../2d';
import { Scene } from '../dom/Scene';
import { useState } from 'react';
import { injector, ModeManager, injectCtor } from '../model';
import { HrMap } from '../2d/basic';
import { IModeManager } from '../interfaces/symbols';

import './ioc.config';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@injectCtor(IModeManager)
class MyWarehouse extends Warehouse {
  constructor(public readonly modeMgr: ModeManager) {
    super();
  }

  async layout(data: any) {
    const edge = new Edge().move([0, 0]).forwards([-8002, 3400], [1200, 9091], [0, 1000]);
    // const edge = new Edge().move([0, 0]).forwards([-8002, 3400]);
    this.add('shelf', edge);
  }
}

export default () => {
  const [warehouse] = useState(() => {
    return injector.$new(MyWarehouse) as MyWarehouse;
  });

  const handleAfter = (root: HrMap) => {
    interactivateAllPanes(root, warehouse.paneManager);
  };

  return <Scene warehouse={warehouse} afterMount={handleAfter} />;
};
