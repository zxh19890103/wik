import L from 'leaflet';
import { Warehouse, Route, basic, Bot } from '../2d';
import { Scene } from '../dom/Scene';
import { useState } from 'react';
import { injectCtor, provides, rootInjector } from '../model';
import * as Interfaces from '../interfaces/symbols';
import { PaneManager } from '../2d/state/PaneManager.class';
import { HighlightManager } from '../2d/state/HighlightManager.class';
import { AnimationManager } from '../2d/animation/AnimationManager.class';
import { ModeManager } from '../model/modes/ModeManager.class';
import { InteractiveStateActionManager } from '../2d/state/InteractiveStateActionManager.class';
import { SelectionManager } from '../2d/state/SelectionManager.class';

import './ioc.config';
import { randomLatLng } from '../utils';
import { SVG_KUBOT } from '../2d/images';

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
