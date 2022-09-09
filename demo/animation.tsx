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
import { ESSS } from './esss';
import { appendAnimation, RotationAnimation, TranslationAnimation } from '../2d/animation';

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

  let bot: hrGUI.Bot;

  for (let i = 0; i < 1; i++) {
    bot = injector.$new<hrGUI.Bot>(hrGUI.Bot, null, 1000, 1000);
    bot.position = L.latLng(Utils.randomInt(-500, 500), Utils.randomInt(-500, 500));
    warehouse.add(ObjectType.bot, bot);
  }

  const esss = new ESSS();
  // 1708980144136261120

  let flied = false;
  let lastAngle: number = null,
    lastLatLng: L.LatLngLiteral = null;

  esss.subscribe('robot#1708980144136261120', (d) => {
    const lng = Number(d.precisePosition.x);
    const lat = Number(d.precisePosition.y);
    const angle = Number(d.robot2mapTheta);

    if (angle !== lastAngle) {
      appendAnimation.call(bot, new RotationAnimation(bot, angle));
      lastAngle = angle;
      console.log('rotate', angle);
    }

    if (!lastLatLng || lat !== lastLatLng.lat || lng !== lastLatLng.lng) {
      appendAnimation.call(bot, new TranslationAnimation(bot, lat, lng));
      lastLatLng = L.latLng(lat, lng);
      console.log('translate', lat, lng);
    }

    if (flied) return;
    setTimeout(() => {
      root.flyTo([lat, lng]);
      flied = true;
    }, 300);
  });
}

export default () => {
  const domRef = useRef<HTMLDivElement>();

  useEffect(() => {
    bootstrap(domRef.current);
  }, []);

  return <div className="hrScene" ref={domRef}></div>;
};
