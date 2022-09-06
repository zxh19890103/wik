import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { HrMap } from '../2d/basic/Map.class';
import './dev.scss';

import * as hrGUIBasic from '../2d/basic';
import * as hrAnimation from '../2d/animation';
import * as hrGUI from '../2d';
import * as Utils from '../utils';
import { SVG_KUBOT } from '../2d/images';
import { injectCtor, injector, ObjectType } from '../model';
import { Warehouse } from '../2d';

import '../ioc.config';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@injectCtor()
class MyWarehouse extends Warehouse {
  layout(data: any): void {}
}

async function bootstrap(container: HTMLDivElement) {
  document.title = 'animation test.';

  const root = new HrMap(container, { zoom: 1.5 });

  const warehouse = injector.$new<MyWarehouse>(MyWarehouse);
  warehouse.mount(root);

  hrGUI.interactivateAllPanes(root, warehouse.paneManager);

  await hrGUIBasic.setDefaultImage(hrGUI.Bot, SVG_KUBOT);

  for (let i = 0; i < 1000; i++) {
    const bot = injector.$new<hrGUI.Bot>(hrGUI.Bot, null, 1000, 1000);
    bot.position = L.latLng(Utils.randomInt(-500, 500), Utils.randomInt(-500, 500));
    warehouse.add(ObjectType.bot, bot);
  }

  setTimeout(() => {
    for (const bot of warehouse.bots) {
      bot.animate(
        hrAnimation.AnimationType.translate,
        Utils.randomInt(-20000, 20000),
        Utils.randomInt(-20000, 20000),
      );
    }

    // setTimeout(() => {
    //   for (const bot of warehouse.bots) {
    //     bot.animate(hrAnimation.AnimationType.rotate, Utils.randomInt(-2000, 2000));
    //   }
    // }, 800);
  }, 4000);
}

export default () => {
  const domRef = useRef<HTMLDivElement>();

  useEffect(() => {
    bootstrap(domRef.current);
  }, []);

  return <div className="hrScene" ref={domRef}></div>;
};
