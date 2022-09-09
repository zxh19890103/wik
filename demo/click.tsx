import L from 'leaflet';
import { Warehouse, basic, interactivateAllPanes } from '../2d';
import { Scene } from '../dom/Scene';
import { useState } from 'react';
import { ObjectType, injector, ModeManager, injectCtor } from '../model';
import { HrMap } from '../2d/basic';
import { IModeManager } from '../interfaces/symbols';

import '../ioc.config';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@injectCtor(IModeManager)
class MyWarehouse extends Warehouse {
  constructor(public readonly modeMgr: ModeManager) {
    super();
  }

  layout(data: any): void {
    const point = new basic.Circle([0, 0], { radius: 3000, color: '#097' });
    this.add(ObjectType.point, point);

    const rect = new basic.Rectangle([0, 0], 8000, 8000, { opacity: 0.34, fillOpacity: 0.3 });
    this.add(ObjectType.shelf, rect);

    const origin = L.marker([0, 0]);
    origin.addTo(this.map);
  }
}

export default () => {
  const [warehouse] = useState(() => {
    return injector.$new(MyWarehouse) as MyWarehouse;
  });

  const handleAfter = (root: HrMap) => {
    interactivateAllPanes(root, warehouse.paneManager);

    warehouse.layout(null);
  };

  return (
    <div>
      <Scene warehouse={warehouse} afterMount={handleAfter} />
    </div>
  );
};
