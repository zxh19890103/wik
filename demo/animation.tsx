import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { HrMap } from '../2d/basic/Map.class';
import 'leaflet/dist/leaflet.css';
import './dev.scss';

import * as hrGUIBasic from '../2d/basic';
import * as hrGUI from '../2d';
import * as Utils from '../utils';
import { MyWarehouse } from './MyWarehouse.class';
import { SVG_KUBOT } from '../2d/images';

L.Icon.Default.imagePath = `${__ENV__.MINIO_END}/fe-libs/leaflet-static/`;

async function bootstrap(container: HTMLDivElement) {
  document.title = 'animation test.';

  const root = new HrMap(container, { zoom: 1.5 });

  const warehouse = new MyWarehouse(null);
  warehouse.mount(root);

  hrGUI.interactivateAllPanes(root, warehouse.paneManager);

  for (let i = 0; i < 30000; i++) {
    warehouse.points.add(
      new hrGUI.Point([Utils.randomInt(-90000, 90000), Utils.randomInt(-90000, 90000)]),
    );
  }

  for (let i = 0; i < 20000; i++) {
    warehouse.shelfs.add(
      new hrGUI.Shelf([Utils.randomInt(-90000, 90000), Utils.randomInt(-90000, 90000)]),
    );
  }

  for (let i = 0; i < 100; i++) {
    warehouse.chargepiles.add(
      new hrGUI.Chargepile([Utils.randomInt(-9000, 9000), Utils.randomInt(-9000, 9000)], null),
    );
  }

  for (let i = 0; i < 100; i++) {
    warehouse.haiports.add(
      new hrGUI.Haiport([Utils.randomInt(-9000, 9000), Utils.randomInt(-9000, 9000)], null),
    );
  }

  await hrGUIBasic.setDefaultImage(hrGUI.Bot, SVG_KUBOT);

  for (let i = 0; i < 1000; i++) {
    const bot = new hrGUI.Bot(null, 1000, 1000);
    bot.position = L.latLng(Utils.randomInt(-500, 500), Utils.randomInt(-500, 500));
    warehouse.addBot(bot);
  }

  setTimeout(() => {
    for (const bot of warehouse.bots) {
      bot.animate(
        hrGUIBasic.hr.AnimationType.translate,
        Utils.randomInt(-20000, 20000),
        Utils.randomInt(-20000, 20000),
      );
    }

    setTimeout(() => {
      for (const bot of warehouse.bots) {
        bot.animate(hrGUIBasic.hr.AnimationType.rotate, Utils.randomInt(-2000, 2000));
      }
    }, 800);

    setTimeout(() => {
      // warehouse.animationManager.stop();
    }, 3000);
  }, 4000);
}

export const TestApp = () => {
  const domRef = useRef<HTMLDivElement>();

  useEffect(() => {
    bootstrap(domRef.current);
  }, []);

  return <div id="devScene" ref={domRef}></div>;
};
