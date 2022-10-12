import L from 'leaflet';
import { Warehouse, DEFAULT_WAREHOUSE_DEPENDENCIES, Bot, Route } from '../2d';
import { useEffect, useState } from 'react';
import { Robot, RobotView, IWarehouse, Point } from '../model';
import { rootInjector, provides, List, inject } from '../model/basic';
import { IInjector } from '../interfaces/symbols';
import * as DOM from '../dom';

import './ioc.config';
import { SVG_KUBOT, SVG_KUBOT_RED } from '../2d/images';
import { Circle, Polyline, setDefaultImage } from '../2d/basic';
import { appendAnimation, RotationAnimation, TranslationAnimation } from '../2d/animation';
import * as Utils from '../utils';
import { PointView } from '../model/PointView';
import { batchedEmits } from '../mixins/Emitter';
import { random2 } from '../utils';
import { FPS, LayerSelectProps, LayerMultipleSelectProps } from '../dom';
import { OnContextMenu, OnMouseOverOut, OnSelect } from '../interfaces/Interactive';
import { ScheduledPathView } from '../model/ScheduledPathView';
import { ContextMenuItem } from '../interfaces/types';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@inject(IInjector)
@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
class MyWarehouse extends Warehouse {
  async layout(data: any) {
    await this.imageManager.load(SVG_KUBOT, SVG_KUBOT_RED);
    await setDefaultImage(Bot, SVG_KUBOT, { offscreenCanvas: false, scale: 1 });
  }

  onLayouted() {}
}

class Bot2 extends Bot implements RobotView {
  model: Robot;

  constructor() {
    super(null, 1000, 1000);
  }

  whenTranslate() {
    const { px, py } = this.model;
    appendAnimation.call(this, new TranslationAnimation(this, py, px));
  }

  whenRotate() {
    appendAnimation.call(this, new RotationAnimation(this, this.model.theta));
  }

  whenInit(): void {
    const { px, py, theta } = this.model;
    this.setPosition(py, px);
    this.setAngle(theta);
  }
}

class Dot extends Circle implements PointView, OnSelect, OnContextMenu, OnMouseOverOut {
  onHover() {
    const c = this.options.color;
    this.setStyle({ color: '#000' });
    return c;
  }

  onUnHover(state?: any): void {
    console.log('em...', state);
    this.setStyle({ color: state });
  }

  onContextMenu(evt?: L.LeafletMouseEvent): ContextMenuItem[] {
    return [{ text: 'Del', value: 'delete' }];
  }

  onContextMenuClick(key: string): void | Promise<any> {
    if (key === 'delete') {
      this.model.remove();
    }
  }

  model: Point;

  whenInit(): void {}

  whenEffect?(effect: string): void {}

  onSelect() {
    const color = this.options.color;
    this.setStyle({ color: '#f12' });
    return color;
  }

  onUnSelect(state?: any): void {
    this.setStyle({ color: state });
  }
}

class BotSchedulePath extends Polyline implements ScheduledPathView {
  model: Robot;

  private lastLatlng = null;

  whenTranslate() {
    const { px, py } = this.model;
    const latlngs = [this.lastLatlng, [py, px]];
    this.setLocalLatLngs(latlngs);
    this.lastLatlng = [py, px];
  }

  whenInit(): void {
    this.lastLatlng = [this.model.py, this.model.px];
  }
}

export default () => {
  const [warehouses] = useState(() => {
    return [
      rootInjector.$new(MyWarehouse) as MyWarehouse,
      rootInjector.$new(MyWarehouse) as MyWarehouse,
      rootInjector.$new(MyWarehouse) as MyWarehouse,
    ];
  });

  const [warehouse, warehouse01, warehouse02] = warehouses;

  const [state] = useState(() => {
    return {
      bots: new List(Robot, []),
      dots: new List(Point, []),
    };
  });

  useEffect(() => {
    setTimeout(() => {
      const bots = batchedEmits(() => {
        return Array(3)
          .fill(0)
          .map((x) => {
            return state.bots.create();
          });
      }, 'size') as Robot[];

      batchedEmits(() => {
        for (let x = 0; x < 30; x++) {
          for (let y = 0; y < 30; y++) {
            const dot = state.dots.create();
            dot.px = x * 700;
            dot.py = y * 600;
          }
        }
      }, 'size');

      Utils.loop(
        () => {
          const bot = bots[0 ^ random2(0, bots.length)];
          const ra = Math.random();
          bot.zone = ra > 0.7 ? '0' : ra > 0.4 ? '1' : '2';
          const px = Utils.random2(-10000, 10000);
          const py = Utils.random2(-10000, 10000);
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
      <FPS off />
      <DOM.Scene modes flex={1} border warehouse={warehouse}>
        <DOM.Warehouse modelViewMapping={modelViewMapping}>
          <DOM.ViewSet
            renderer="canvas"
            type="bot2"
            model={state.bots}
            reactOn="zone"
            filter="zone=0"
            zIndex={490}
          />
          <DOM.ViewSet renderer="canvas" type="dot" model={state.dots} zIndex={489} fit />
          {/* <DOM.ViewSet zIndex={498} renderer="canvas" type="route" model={state.bots} /> */}
        </DOM.Warehouse>
      </DOM.Scene>
      <DOM.Scene modes flex={1} border warehouse={warehouse01}>
        <DOM.Warehouse modelViewMapping={modelViewMapping}>
          <DOM.ViewSet
            renderer="canvas"
            type="bot2"
            model={state.bots}
            reactOn="zone"
            filter="zone=1"
            zIndex={490}
          />
          <DOM.ViewSet renderer="canvas" type="dot" model={state.dots} zIndex={489} fit />
        </DOM.Warehouse>
      </DOM.Scene>
      <DOM.Scene modes flex={1} border warehouse={warehouse02}>
        <DOM.Warehouse modelViewMapping={modelViewMapping}>
          <DOM.ViewSet
            renderer="canvas"
            type="bot2"
            model={state.bots}
            reactOn="zone"
            filter="zone=2"
            zIndex={490}
          />
          <DOM.ViewSet renderer="canvas" type="dot2" model={state.dots} zIndex={489} fit />
        </DOM.Warehouse>
      </DOM.Scene>
      <DOM.Scene.SelectShell w={200}>
        <DetailBot C={Bot2} />
        <DetailDot C={Dot} />
      </DOM.Scene.SelectShell>
      <DOM.Scene.MultipleSelectShell w={100}>
        <Batch />
      </DOM.Scene.MultipleSelectShell>
    </DOM.Scene.Layout>
  );
};

const DetailBot = (props: LayerSelectProps<{}>) => {
  const { model } = props;
  return (
    <div>
      <div>it's a bot # {model.layerId}</div>
      <div>{props.position}</div>
    </div>
  );
};

const DetailDot = (props: LayerSelectProps<{}>) => {
  const { model } = props;
  return (
    <div>
      <h3>it's a dot </h3>
      <div># {model.layerId}</div>
      <div>{props.position}</div>
    </div>
  );
};

const Batch = (props: LayerMultipleSelectProps) => {
  return <div>{props.model.length} items</div>;
};

const modelViewMapping = {
  bot2: (m: any, w: IWarehouse) => w.injector.$new(Bot2),
  bot3: (m: any, w: IWarehouse) => {
    const bot = w.injector.$new(Bot2);
    bot.setImage(bot.imageManager.getOffscreenCanvas(SVG_KUBOT_RED));
    return bot;
  },
  route: (m: any) => {
    return new BotSchedulePath([]);
  },
  dot: (m: any, w: IWarehouse) => {
    return new Dot([m.py, m.px], {
      radius: 200,
      color: 'green',
      fill: true,
      opacity: 0.6178, // This cause frames drop for latest version of Chrome.
      fillOpacity: 0.1, // seems fixed.~~// This cause frames drop for latest version of Chrome.
    });
  },
  dot2: (m: any, w: IWarehouse) => {
    return new Dot([m.py, m.px], {
      radius: 100,
      color: 'red',
      fill: true,
      opacity: 1, // This cause frames drop for latest version of Chrome.
      fillOpacity: 1, // This cause frames drop for latest version of Chrome.
    });
  },
};

/**
 *       <DOM.Scene flex={1} border warehouse={warehouse01}>
        <DOM.Warehouse modelViewMapping={modelViewMapping}>
          <DOM.ViewSet
            renderer="canvas"
            type="dot"
            model={state.dots}
            filter={(item: Point) => {
              return item.px > 10000 && item.px < 30000;
            }}
            fit
          />
          <DOM.ViewSet
            renderer="canvas"
            type="bot3"
            model={state.bots}
            reactOn="zone"
            filter="zone=1"
          />
        </DOM.Warehouse>
      </DOM.Scene>
      <DOM.Scene flex={1} border warehouse={warehouse02}>
        <DOM.Warehouse modelViewMapping={modelViewMapping}>
          <DOM.ViewSet
            renderer="canvas"
            type="dot2"
            model={state.dots}
            filter={(item: Point) => {
              return item.px > 30000;
            }}
            fit
          />
          <DOM.ViewSet
            renderer="canvas"
            type="bot3"
            model={state.bots}
            reactOn="zone"
            filter="zone=2"
          />
        </DOM.Warehouse>
      </DOM.Scene>
 */
