import L from 'leaflet';
import { EssWarehouse, basic } from '../2d';
import { DEFAULT_WAREHOUSE_DEPENDENCIES } from '../2d/basic';
import * as wik from '../dom/general';
import { useState } from 'react';
import { inject, rootInjector, provides } from '../model/basic';
import { IInjector } from '../interfaces/symbols';
import { Bot } from '../2d/Bot.class';

import './ioc.config';
import { SVG_KUBOT, SVG_KUBOT_RED } from '../2d/images';
import { MultipleObjectsSelectProps } from '../dom/general';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@inject(IInjector)
@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
class MyWarehouse extends EssWarehouse {
  async layout(data: any) {
    const point = new basic.Circle([0, 0], { radius: 1000, color: '#097' });
    this.add('point', point);

    await this.imageManager.load(SVG_KUBOT, SVG_KUBOT_RED);

    const bot = this.injector.$new<Bot>(Bot, this.imageManager.get(SVG_KUBOT_RED), 1000, 1000);
    this.add('bot', bot);
  }
}

export default () => {
  const [warehouse] = useState(() => {
    return rootInjector.$new(MyWarehouse) as MyWarehouse;
  });

  return (
    <wik.World defaultKeys={['2d']}>
      <wik.Warehouse key="2d" modes warehouse={warehouse} />
      <wik.MultipleSelectShell w={400}>
        <Aside />
      </wik.MultipleSelectShell>
    </wik.World>
  );
};

const Aside = (props: MultipleObjectsSelectProps<any>) => {
  return <div>{props.model?.length}</div>;
};
