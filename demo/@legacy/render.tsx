import L from 'leaflet';
import { EssWarehouse, Bot } from '../../2d';
import { DEFAULT_WAREHOUSE_DEPENDENCIES } from '../../2d/basic';
import { useEffect, useState } from 'react';
import { rootInjector, provides, List, inject } from '../../model/basic';

import { Robot, RobotView, RobotEffect, IWarehouse, Point } from '../../model';
import { IInjector } from '../../interfaces/symbols';
import * as DOM from '../../dom';
import Stats from 'stats.js';

import '../ioc.config';
import { SVG_KUBOT, SVG_KUBOT_RED } from '../../2d/images';
import { Circle, setDefaultImage } from '../../2d/basic';
import { appendAnimation, RotationAnimation, TranslationAnimation } from '../../2d/animation';
import * as Utils from '../../utils';
import { PointView } from '../../model/PointView';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@inject(IInjector)
@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
class MyWarehouse extends EssWarehouse {
  async layout(data: any) {
    await this.imageManager.load(SVG_KUBOT, SVG_KUBOT_RED);
    setDefaultImage(Bot, SVG_KUBOT, { offscreenCanvas: false, scale: 1 });
  }

  onLayouted() {
    const stats = new Stats();
    stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    function animate() {
      stats.begin();

      // monitored code goes here

      stats.end();

      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);

    this.shelfs.fit();
  }
}

class Bot2 extends Bot implements RobotView {
  model: Robot;

  constructor() {
    super(null, 1000, 1000);
  }

  whenTranslate() {
    const { px, py } = this.model;
    appendAnimation.call(this, new TranslationAnimation(this, py, px));
    // this.setPosition(py, px);
  }

  whenRotate() {
    appendAnimation.call(this, new RotationAnimation(this, this.model.theta));
  }

  whenInit(): void {
    const { px, py, theta } = this.model;
    this.setPosition(py, px);
    this.setAngle(theta);
  }

  whenEffect?(effect: RobotEffect): void {}
}

class Dot extends Circle implements PointView {
  model: Point;

  whenInit(): void {}

  whenEffect?(effect: string): void {}
}

export default () => {
  const [warehouses] = useState(() => {
    return [
      rootInjector.$new(MyWarehouse) as MyWarehouse,
      rootInjector.$new(MyWarehouse) as MyWarehouse,
    ];
  });

  const [warehouse, warehouse01] = warehouses;

  const [state] = useState(() => {
    return {
      bots: new List(Robot, []),
      dots: new List(Point, []),
    };
  });

  useEffect(() => {
    setTimeout(() => {
      const bot = state.bots.create();

      const dots = [];
      for (let x = 0; x < 200; x++) {
        for (let y = 0; y < 200; y++) {
          const dot = new Point();
          dot.px = x * 1000;
          dot.py = y * 1000;
          dots.push(dot);
        }
      }

      state.dots.addArr(dots);

      Utils.loop(
        () => {
          const px = Utils.random2(0, 3000);
          const py = Utils.random2(0, 1000);
          bot.setPosition(px, py);
        },
        {
          auto: true,
        },
      );
    }, 4000);
  }, []);

  return (
    <DOM.Scene.Layout flow="horizontal" w="100vw" h="100vh">
      <DOM.Scene flex={1} border warehouse={warehouse}>
        <DOM.Warehouse modelViewMapping={modelViewMapping}>
          <DOM.ViewSet renderer="canvas" type="bot2" model={state.bots} />
          <DOM.ViewSet renderer="canvas" type="dot" model={state.dots} fit />
        </DOM.Warehouse>
      </DOM.Scene>
    </DOM.Scene.Layout>
  );
};

const modelViewMapping = {
  bot2: (m: any, w: IWarehouse) => w.injector.$new(Bot2),
  dot: (m: any, w: IWarehouse) => {
    return new Dot([m.py, m.px], {
      radius: 300,
      color: 'green',
      fill: true,
      opacity: 1, // This cause frames drop for latest version of Chrome.
      fillOpacity: 1, // This cause frames drop for latest version of Chrome.
    });
  },
};
