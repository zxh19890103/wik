import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import './dev.scss';

import * as Util from '../utils';
import * as hrGUI from '../2d';
import * as hrGUIBasic from '../2d/basic';

import * as hrModel from '../model';
import { Scene } from '../dom/Scene';
import { inject, List, provides, rootInjector } from '../model/basic';

import './ioc.config';
import { Views } from '../model/basic/Views.class';
import { SVG_KUBOT, SVG_KUBOT_RED } from '../2d/images';
import { DEFAULT_WAREHOUSE_DEPENDENCIES, Warehouse } from '../2d';
import * as Interfaces from '../interfaces/symbols';

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

  constructor() {
    super([]);
  }

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

@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
@inject(Interfaces.IInjector)
class Warehouse007 extends Warehouse {
  async layout(data?: any) {
    const bots = new List(hrModel.Robot, []);

    await this.imageManager.load(SVG_KUBOT, SVG_KUBOT_RED);

    /**
     * <Warehouse>
     * {
     *  bots.map(bot => {
     *    return <MyRobotView2 model={bot} />;
     *  })
     * }
     * </Warehouse>
     */

    new Views({
      source: bots,
      views: this.bots as any,
      make: (m) => new MyRobotView2(),
    });

    new Views({
      source: bots,
      views: this.shelfs as any,
      make: (m) => new MyRobotView(this.imageManager.get(SVG_KUBOT), 1000, 1000),
    });

    new Views({
      source: bots,
      views: this.points as any,
      make: (m) => new MyRobotView3([0, 0]),
    });

    for (let i = 0; i < 30; i++) {
      const bot = new hrModel.Robot();
      bot.px = Util.random2(-1000, 1000);
      bot.py = Util.random2(-1000, 1000);
      bot.theta = Util.random2(0, 360);
      bots.add(bot);
    }

    let theta = 0;
    const loop = () => {
      setTimeout(loop, 500);
      theta += 1;
      let b = null;
      for (const bot of bots) {
        bot.setPosition(Util.random2(-10000, 10000), Util.random2(-10000, 10000));
        bot.setTheta(theta);
        b = bot;
      }

      bots.remove(b);
    };

    loop();
  }
}

export default () => {
  const [warehouse] = useState(() => {
    return rootInjector.$new(Warehouse007);
  });

  return <Scene warehouse={warehouse} />;
};
