import L from 'leaflet';
import { useEffect, useRef } from 'react';
import { WikMap } from '../2d/basic/Map.class';
import './dev.scss';

import * as hrGUIBasic from '../2d/basic';
import * as hrGUI from '../2d';
import * as Utils from '../utils';
import { SVG_KUBOT } from '../2d/images';
import { rootInjector } from '../model/basic';
import { EssWarehouse } from '../2d';

import './ioc.config';
import { ESSS } from './esss';
import ROBOT_IDS_IN_110 from './robotids';
import { appendAnimation, RotationAnimation, TranslationAnimation } from '../2d/animation';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

class MyWarehouse extends EssWarehouse {
  layout(data: any): void {}
}

async function bootstrap(container: HTMLDivElement) {
  document.title = 'animation test.';

  const root = new WikMap(container, { zoom: 1.5 });

  const warehouse = rootInjector.$new<MyWarehouse>(MyWarehouse);
  warehouse.mount(root);

  await hrGUIBasic.setDefaultImage(hrGUI.Bot, SVG_KUBOT);

  const id_mapping = {};
  const initial_state = {};

  for (let i = 0; i < 60; i++) {
    const bot = warehouse.injector.$new<hrGUI.Bot>(hrGUI.Bot, null, 1000, 1000);
    bot.position = L.latLng(Utils.random2(-500, 500), Utils.random2(-500, 500));
    warehouse.add('bot', bot);
    const srcid = ROBOT_IDS_IN_110[i];
    id_mapping[bot.layerId] = srcid;
    id_mapping[srcid] = bot.layerId;
    initial_state[bot.layerId] = null;
  }

  const esss = new ESSS();

  const center = [28850, 41590] as any;
  root.setView(center);

  esss.subscribe('robot', (d) => {
    const srcid = d.id;
    const botId = id_mapping[srcid];
    const bot = warehouse.bots.find(botId);
    if (!bot) {
      return;
    }

    const lng = Number(d.precisePosition.x);
    const lat = Number(d.precisePosition.y);
    const angle = Number(d.robot2mapTheta);

    if (!initial_state[botId]) {
      // set
      bot.setPosition({ lat, lng });
      bot.setAngle(angle);

      initial_state[botId] = {
        p: { lat, lng },
        a: angle,
      };
    } else {
      // update
      const state = initial_state[botId];
      if (angle !== state.a) {
        appendAnimation.call(bot, new RotationAnimation(bot, angle));
        state.a = angle;
        console.log('rotate', angle);
      }
      if (lat !== state.p.lat || lng !== state.p.lng) {
        appendAnimation.call(bot, new TranslationAnimation(bot, lat, lng));
        state.p = { lat, lng };
        console.log('translate', lat, lng);
      }
    }
  });

  const { random } = Math;
  const randomLatLng = () => {
    return [-10000 + center[0] + random() * 20000, -10000 + center[1] + random() * 20000];
  };

  const loop = () => {
    setTimeout(loop, 30);
    for (const bot of warehouse.bots) {
      const [y, x] = randomLatLng();
      appendAnimation.call(bot, new TranslationAnimation(bot, y, x));
    }
  };

  // setTimeout(loop, 5000);
}

export default () => {
  const domRef = useRef<HTMLDivElement>();

  useEffect(() => {
    bootstrap(domRef.current);
  }, []);

  return <div className="hrScene" ref={domRef}></div>;
};
