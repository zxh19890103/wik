import L from 'leaflet';
import { EssWarehouse, Point, Chargepile, Haiport } from '../2d';
import { DEFAULT_WAREHOUSE_DEPENDENCIES } from '../2d/basic';
import { LayerSelectProps, LayerMultipleSelectProps, Scene } from '../dom/Scene';
import { useEffect, useState } from 'react';
import { rootInjector, provides, inject } from '../model/basic';
import { ModeManager } from '../model/modes';
import * as Interfaces from '../interfaces/symbols';
import { Bot } from '../2d/Bot.class';

import { SVG_CHARGEPILE, SVG_KUBOT, SVG_KUBOT_RED } from '../2d/images';
import { IInjector } from '../interfaces/Injector';

import './ioc.config';
import { Circle, Rectangle, setDefaultImage } from '../2d/basic';
import { random2 } from '../utils';
import { appendAnimation, TranslationAnimation } from '../2d/animation';
import { FPS } from '../dom';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
@inject(Interfaces.IModeManager, Interfaces.IInjector)
class MyWarehouse extends EssWarehouse {
  constructor(public readonly modeMgr: ModeManager, inj: IInjector) {
    super(inj);
  }

  async layout(data: any) {
    console.log(data);

    await this.imageManager.load(SVG_KUBOT, SVG_KUBOT_RED, SVG_CHARGEPILE);

    console.time('point');
    for (const p of data.point) {
      const { x, y } = p.position;
      const point = new Point([y, x]);
      point.$$ref = p;
      this.add('point', point);
    }
    console.timeEnd('point');
    console.log('point total', data.point.length);

    {
      let total = 0;
      console.time('location');
      for (const location of data.location) {
        switch (location.locationTypeCode) {
          case 'LT_SHELF_STORAGE': {
            const add = this.makeShelf(location);
            total += add;
            break;
          }
          case 'LT_CHARGE': {
            this.add('chargepile', this.createChargepile(location));
            total += 1;
            break;
          }
          case 'LT_HAIPORT': {
            this.add('haiport', this.createHaiport(location));
            total += 1;
            break;
          }
          case 'LT_LABOR': {
            this.add('labor', this.createLaborRestMaintain(location, 'labor'));
            total += 1;
            break;
          }
          case 'LT_REST': {
            this.add('rest', this.createLaborRestMaintain(location, 'rest'));
            total += 1;
            break;
          }
          case 'LT_MAINTAIN': {
            this.add('maintain', this.createLaborRestMaintain(location, 'maintain'));
            total += 1;
            break;
          }
        }
      }
      console.timeEnd('location');
      console.log('location total', total);
    }

    setDefaultImage(Bot, SVG_KUBOT, { offscreenCanvas: true, scale: 1 });

    /**
     * draw image is very expensive.
     */
    for (let i = 0; i < 1000; i++) {
      const bot = this.injector.$new<Bot>(Bot, null, 5000, 5000);
      this.add('bot', bot);
      this._bots.push(bot);
      this._bots_size += 1;
    }
  }

  private _bots = [];
  private _bots_size = 0;

  randomBot() {
    return this._bots[0 ^ (Math.random() * this._bots_size)];
  }

  private createChargepile(data) {
    const { x, y } = data.position;
    const chargepile = new Chargepile([y, x]);
    chargepile.$$ref = data;
    return chargepile;
  }

  private createHaiport(data) {
    const { x, y } = data.position;
    const chargepile = new Haiport([y, x]);
    chargepile.$$ref = data;
    return chargepile;
  }

  private createLaborRestMaintain(data, type: 'labor' | 'rest' | 'maintain') {
    const { x, y } = data.position;
    const color = type === 'labor' ? '#098' : type === 'rest' ? '#980' : '#908';
    const location = new Circle([y, x], { radius: 600, color, fill: true });
    location.$$ref = data;
    return location;
  }

  onLayouted() {
    this.shelfs.fit();
  }

  private _shelfs = new Map();
  private makeShelf(data) {
    const { position } = data;
    const theta = data.link[0]?.container2mapTheta || '0';
    const { x, y } = position;
    const identity = `${x},${y},${theta}`;

    let shelf: Rectangle = null;

    if (this._shelfs.has(identity)) {
      return 0;
    } else {
      // 0,90,180,270,
      const latlng = { lat: Number(y), lng: Number(x) };
      let color = '#000';

      if (theta === '270') {
        latlng.lat -= 460;
      } else if (theta === '180') {
        latlng.lng += 460;
        color = '#180';
      } else if (theta === '90') {
        latlng.lat += 460;
      } else {
        color = '#018';
        latlng.lng -= 460;
      }

      shelf = new Rectangle(latlng, 300, 300, { color });
      this.add('shelf', shelf);
      this._shelfs.set(identity, true);
      return 1;
    }
  }

  getLayoutData(): Promise<any> {
    return fetch('/__data__/xianbei').then((r) => r.json());
  }
}

export default () => {
  const [warehouse] = useState(() => {
    return rootInjector.$new(MyWarehouse) as MyWarehouse;
  });

  useEffect(() => {
    const animate = () => {
      // setTimeout(animate, 5000);
      // const bot = warehouse.randomBot();

      for (const bot of warehouse.bots) {
        // 1300,7791
        // 96961, 492732
        const lat = random2(1300, 96961);
        const lng = random2(7791, 492732);

        appendAnimation.call(bot, new TranslationAnimation(bot, lat, lng));
      }
    };

    setTimeout(animate, 5000);
  }, []);

  return (
    <Scene.Layout flow="horizontal">
      <FPS />
      <Scene modes flex={1} warehouse={warehouse} onPhase={null} />
      {/* <Scene.SelectShell w={340}>
        <Detail />
      </Scene.SelectShell> */}
      <Scene.MultipleSelectShell w={100}>
        <Batch />
      </Scene.MultipleSelectShell>
    </Scene.Layout>
  );
};

const Detail = (props: LayerSelectProps) => {
  const { model } = props;

  const { position, layerId, angle } = model;

  return (
    <div>
      ID: {layerId}
      <br />
      Coordinates: {Math.round(position.lng)}, {Math.round(position.lat)}
      <br />
      Angle: {angle.toFixed(2)}
    </div>
  );
};

const Batch = (props: LayerMultipleSelectProps) => {
  return <div>{props.model?.length} items</div>;
};
