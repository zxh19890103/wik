import L from 'leaflet';
import { Warehouse, basic, DEFAULT_WAREHOUSE_DEPENDENCIES } from '../2d';
import { LayerSelectProps, Scene } from '../dom/Scene';
import { useState } from 'react';
import { inject, rootInjector, provides } from '../model/basic';
import { IInjector } from '../interfaces/symbols';

import './ioc.config';
import { SVG_KUBOT, SVG_KUBOT_RED } from '../2d/images';
import { loop } from '../utils';
import { OnMouseOverOut } from '../interfaces/Interactive';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

class Circle1 extends basic.Circle implements OnMouseOverOut {
  onHover() {
    this.setStyle({ color: '#000' });
  }

  onUnHover(state?: any): void {
    this.setStyle({ color: '#f09' });
  }
}

class RECT extends basic.Rectangle implements OnMouseOverOut {
  onHover() {
    this.setStyle({ color: '#999' });
  }

  onUnHover(state?: any): void {
    this.setStyle({ color: '#ad6' });
  }
}

@inject(IInjector)
@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
class MyWarehouse extends Warehouse {
  async layout(data: any) {
    const point = new basic.Circle([3000, 6000], { radius: 60, color: 'red' });
    this.add('point', point);

    await this.imageManager.load(SVG_KUBOT, SVG_KUBOT_RED);

    const g0 = this.injector.$new(basic.Group, [], { pane: 'group01' });
    const p1 = new Circle1([300, 900], {
      radius: 100,
      color: '#097',
      fill: true,
      interactive: true,
    });
    const p2 = new Circle1([800, 900], { radius: 100, color: '#876', fill: true });
    const r2 = new RECT([300, 600], 200, 100, { color: '#f90', fill: true });

    this.map.addLayer(g0);

    g0.addChild(p1, r2, p2);

    g0.translate(3000, 6000);

    // let a = 0;

    loop(
      () => {
        g0.rotate(1);
      },
      {
        auto: false,
        duration: 1000,
      },
    );

    // const bot = this.injector.$new<Bot>(Bot, this.imageManager.get(SVG_KUBOT_RED), 1000, 1000);
  }
}

export default () => {
  const [warehouse] = useState(() => {
    return rootInjector.$new(MyWarehouse) as MyWarehouse;
  });

  return (
    <Scene.Layout flow="horizontal">
      <Scene view={[3000, 6000, 3]} modes flex={1} warehouse={warehouse} />
      <Scene.SelectShell w={256}>
        <GroupDetail />
      </Scene.SelectShell>
    </Scene.Layout>
  );
};

const GroupDetail = (props: LayerSelectProps) => {
  return (
    <div>
      group#{props.model.layerId} {props.position}
    </div>
  );
};
