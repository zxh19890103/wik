import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { HrMap } from '../2d/basic/Map.class';
import './dev.scss';

import * as Util from '../utils';
import * as hrGUI from '../2d';
import * as hrGUIBasic from '../2d/basic';

import * as hrModel from '../model';
import { Scene } from '../dom/Scene';
import { injector, List } from '../model';
import { MyWarehouse } from './MyWarehouse.class';

import './ioc.config';
import { Views } from '../model/basic/Views.class';
import { SVG_KUBOT, SVG_KUBOT_RED } from '../2d/images';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

class MyRobotView extends hrGUI.Bot implements hrModel.RobotView {
  model: hrModel.Robot;

  whenTranslate() {
    this.setPosition(this.model.py, this.model.px);
  }

  whenRotate() {
    this.setAngle(this.model.theta);
  }

  whenInit() {}
}

class MyRobotView2 extends hrGUIBasic.Polygon implements hrModel.RobotView {
  model: hrModel.Robot;

  whenTranslate() {
    this.setPosition(this.model.py, this.model.px);
  }

  whenRotate() {
    this.setAngle(this.model.theta);
  }

  whenInit() {
    this.setLocalLatLngs([
      [-1000, -1000],
      [1000, 1000],
      [0, 0],
    ]);

    this.setPosition(this.model.py, this.model.px);
    this.setAngle(this.model.theta);
  }
}

class MyRobotView3 extends hrGUIBasic.Circle implements hrModel.RobotView {
  model: hrModel.Robot;

  whenTranslate() {
    this.setPosition(this.model.py, this.model.px);
  }

  whenRotate() {
    // this.setAngle(this.model.theta);
  }

  whenInit() {
    this.setRadius(4000);
    this.setPosition(this.model.py, this.model.px);
  }
}

export default () => {
  const [warehouse] = useState(() => {
    return injector.$new<MyWarehouse>(MyWarehouse);
  });

  const handleAfter = async (root: HrMap) => {
    const bots = new List(hrModel.Robot, []);

    await warehouse.imageManager.load(SVG_KUBOT, SVG_KUBOT_RED);

    new Views({
      source: bots,
      views: warehouse.bots as any,
      make: (m) => new MyRobotView2([]),
    });

    new Views({
      source: bots,
      views: warehouse.shelfs as any,
      make: (m) => new MyRobotView(warehouse.imageManager.get(SVG_KUBOT), 1000, 1000),
    });

    new Views({
      source: bots,
      views: warehouse.points as any,
      make: (m) => new MyRobotView3([0, 0]),
    });

    for (let i = 0; i < 30; i++) {
      const bot = new hrModel.Robot();
      bot.px = Util.randomInt(-1000, 1000);
      bot.py = Util.randomInt(-1000, 1000);
      bot.theta = Util.randomInt(0, 360);
      bots.add(bot);
    }

    let theta = 0;
    const loop = () => {
      setTimeout(loop, 500);
      theta += 1;
      let b = null;
      for (const bot of bots) {
        bot.setPosition(Util.randomInt(-10000, 10000), Util.randomInt(-10000, 10000));
        bot.setTheta(theta);
        b = bot;
      }

      bots.remove(b);
    };

    loop();
  };

  return <Scene warehouse={warehouse} afterMount={handleAfter} />;
};
