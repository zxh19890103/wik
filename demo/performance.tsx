import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { HrMap } from '../2d/basic/Map.class';
import './dev.scss';

import * as hrGUIBasic from '../2d/basic';
import * as hrGUI from '../2d';
import * as Utils from '../utils';
import { SVG_KUBOT } from '../2d/images';
import { inject, rootInjector } from '../model/basic';
import { Warehouse } from '../2d';

import './ioc.config';
import { appendAnimation, TranslationAnimation } from '../2d/animation';
import { IInjector } from '../interfaces/symbols';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@inject(IInjector)
class MyWarehouse extends Warehouse {
  layout(data: any): void {}
}

async function bootstrap(container: HTMLDivElement) {
  document.title = 'animation test.';

  const root = new HrMap(container, { zoom: 1.5 });

  const warehouse = rootInjector.$new<MyWarehouse>(MyWarehouse);
  warehouse.mount(root);

  await hrGUIBasic.setDefaultImage(hrGUI.Bot, SVG_KUBOT);

  for (let i = 0; i < 1000; i++) {
    const position = L.latLng(Utils.random2(-500, 500), Utils.random2(-500, 500));
    const bot = new hrGUI.basic.Circle(position, { radius: 1000 });
    rootInjector.writeProp(bot, 'animationMgr', warehouse.animationManager);
    warehouse.add('bot', bot);
  }

  const { random } = Math;
  const r = 100000;

  const randomLatLng = () => {
    return [-r + 2 * random() * r, -r + 2 * random() * r];
  };

  const loop = () => {
    setTimeout(loop, 30);
    for (const bot of warehouse.bots) {
      const [y, x] = randomLatLng();
      appendAnimation.call(bot, new TranslationAnimation(bot, y, x));
    }
  };

  setTimeout(loop, 5000);
}

export default () => {
  const domRef = useRef<HTMLDivElement>();

  useEffect(() => {
    bootstrap(domRef.current);
  }, []);

  return <div className="hrScene" ref={domRef}></div>;
};
