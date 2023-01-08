import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { WikMap } from '../2d/basic/Map.class';
import './dev.scss';

import * as hrGUI from '../2d';
import * as Utils from '../utils';
import { MyWarehouse } from './MyWarehouse.class';

import './ioc.config';
import { SVG_KUBOT, SVG_KUBOT_RED } from '../2d/images';
import { rootInjector } from '../model/basic';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

async function bootstrap(container: HTMLDivElement, initialData: any) {
  document.title = 'animation test.';

  const root = new WikMap(container, { zoom: 1.5 });
  const warehouse = rootInjector.$new<MyWarehouse>(MyWarehouse);
  warehouse.mount(root);

  const { imageManager } = warehouse;

  await imageManager.load(SVG_KUBOT, SVG_KUBOT_RED);

  const bots: hrGUI.Bot[] = [];
  for (let i = 0; i < 10; i++) {
    const bot = warehouse.injector.$new<hrGUI.Bot>(
      hrGUI.Bot,
      imageManager.get(SVG_KUBOT),
      1000,
      1000,
    );
    bot.position = L.latLng(Utils.randomLatLng(9000));
    bots.push(bot);
    warehouse.add('bot', bot);
  }

  const size = bots.length;

  const loop = () => {
    setTimeout(loop, 100);
    const index = 0 ^ (Math.random() * size);
    warehouse.update('bot', bots[index], {
      error: Math.random() > 0.5,
    });
  };

  // setTimeout(loop, 3000);
}

export default () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/__data__/ModelJson2')
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        console.log(d);
      });
  }, []);

  if (data === null) {
    return <em>loading...</em>;
  }

  return <Scene initialData={data} />;
};

export const Scene = (props: { initialData: any }) => {
  const domRef = useRef<HTMLDivElement>();

  useEffect(() => {
    setTimeout(async () => {
      try {
        await bootstrap(domRef.current, props.initialData);
      } catch (ex) {
        // window.location.reload();
        console.log(ex);
      }
    }, 1000);
  }, []);

  return <div className="hrScene" ref={domRef}></div>;
};
