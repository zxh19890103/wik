import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { HrMap } from '../2d/basic/Map.class';
import './dev.scss';

import * as Util from '../utils';
import * as hrGUI from '../2d';
import * as hrGUIBasic from '../2d/basic';

import * as hrModel from '../model';
import { Scene } from '../dom/Scene';
import { makeModelView, injector } from '../model';
import { MyWarehouse } from './MyWarehouse.class';

import './ioc.config';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

class MyRobotView extends hrGUI.Robot implements hrModel.RobotView {
  model: hrModel.Robot;

  whenTranslate(dxy) {
    this.setPosition(this.model.py, this.model.px);
  }

  whenRotate(dd: number) {
    this.setAngle(this.model.theta);
  }

  whenTrash(): void {
    this.remove();
  }

  whenInit() {}
}

class MyRobotView2 extends hrGUIBasic.Polygon implements hrModel.RobotView {
  model: hrModel.Robot;

  whenTranslate() {
    this.setPosition(this.model.py, this.model.px);
  }

  whenRotate(dd: number) {
    this.setAngle(this.model.theta);
  }

  whenTrash(): void {
    this.remove();
  }

  whenInit() {
    this.setLocalLatLngs([
      [-1000, 10000],
      [10000, 300],
      [10, 40000],
    ]);

    this.setPosition(this.model.py, this.model.px);
    this.setAngle(this.model.theta);
  }
}

export default () => {
  const [warehouse] = useState(() => {
    return injector.$new<MyWarehouse>(MyWarehouse);
  });

  const handleAfter = async (root: HrMap) => {
    const bots: hrModel.Robot[] = [];
    for (let i = 0; i < 5; i++) {
      const bot = new hrModel.Robot();
      bot.px = Util.randomInt(-1000, 1000);
      bot.py = Util.randomInt(-1000, 1000);
      bot.theta = Util.randomInt(0, 360);
      bots.push(bot);
    }

    hrGUI.interactivateAllPanes(root, warehouse.paneManager);

    warehouse.mount(root);

    console.log('for bot in');
    for (const bot of bots) {
      const view = new MyRobotView2([]);
      makeModelView(view, bot);
      warehouse.add('bot', view);
    }
    console.log('for bot out');

    // warehouse.layout(null);

    let theta = 0;
    const loop = () => {
      setTimeout(loop, 500);
      theta += 1;
      for (const bot of bots) {
        // bot.setPosition(Util.randomInt(-10000, 10000), Util.randomInt(-10000, 10000));
        bot.setTheta(theta);
      }
    };

    loop();
  };

  return <Scene warehouse={warehouse} afterMount={handleAfter} />;
};
