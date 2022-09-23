import L from 'leaflet';
import { Warehouse, Route, basic } from '../2d';
import { Scene } from '../dom/Scene';
import { useState } from 'react';
import { injectCtor, provides, rootInjector } from '../model';
import * as Interfaces from '../interfaces/symbols';
import { HrMap } from '../2d/basic';
import { PaneManager } from '../2d/state/PaneManager.class';
import { HighlightManager } from '../2d/state/HighlightManager.class';
import { AnimationManager } from '../2d/animation/AnimationManager.class';
import { ModeManager } from '../model/modes/ModeManager.class';
import { InteractiveStateActionManager } from '../2d/state/InteractiveStateActionManager.class';
import { SelectionManager } from '../2d/state/SelectionManager.class';

import './ioc.config';
import { randomColor, randomLatLng } from '../utils';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@injectCtor(Interfaces.IInjector)
@provides({
  [Interfaces.IPaneManager]: PaneManager,
  [Interfaces.IStateActionManager]: InteractiveStateActionManager,
  [Interfaces.IModeManager]: ModeManager,
  [Interfaces.IAnimationManager]: AnimationManager,
  [Interfaces.IHighlightManager]: HighlightManager,
  [Interfaces.ISelectionManager]: SelectionManager,
})
class MyWarehouse extends Warehouse<any, 'routes'> {
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

@injectCtor(Interfaces.IInjector)
@provides({
  [Interfaces.IPaneManager]: PaneManager,
  [Interfaces.IStateActionManager]: InteractiveStateActionManager,
  [Interfaces.IModeManager]: ModeManager,
  [Interfaces.IAnimationManager]: AnimationManager,
  [Interfaces.IHighlightManager]: HighlightManager,
  [Interfaces.ISelectionManager]: SelectionManager,
})
class MyWarehouse2 extends Warehouse<any, 'routes'> {
  async layout(data: any) {
    this.addLayerList('routes', { pane: 'routesPane', rendererBy: 'canvas' });

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
    return [
      rootInjector.$new(MyWarehouse) as MyWarehouse,
      rootInjector.$new(MyWarehouse2) as MyWarehouse,
    ];
  });

  const handleAfter = (root: HrMap) => {};
  const [wh0, wh1] = warehouses;

  return (
    <div>
      <Scene bgColor={randomColor()} warehouse={wh0} afterMount={handleAfter} />
      <Scene bgColor={randomColor()} warehouse={wh1} afterMount={handleAfter} />
    </div>
  );
};
