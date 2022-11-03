import L from 'leaflet';
import { EssWarehouse, basic } from '../2d';
import { DEFAULT_WAREHOUSE_DEPENDENCIES } from '../2d/basic';
import { LayerSelectProps, Scene } from '../dom/Scene';
import { useState } from 'react';
import { inject, rootInjector, provides } from '../model/basic';
import { IInjector } from '../interfaces/symbols';

import './ioc.config';
import { SVG_KUBOT, SVG_KUBOT_RED } from '../2d/images';
import { loop, randomColor, randomLatLng } from '../utils';
import { OnMouseOverOut } from '../interfaces/Interactive';
import { FPS } from '../dom';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

class Circle1 extends basic.Circle implements OnMouseOverOut {
  onHover() {
    const color = this.options.color;
    this.setStyle({ color: '#987' });
    return color;
  }

  onUnHover(state?: any): void {
    this.setStyle({ color: state });
  }
}

class RECT extends basic.Rectangle implements OnMouseOverOut {
  onHover() {
    const c = this.options.color;
    this.setStyle({ color: '#999' });
    return c;
  }

  onUnHover(state?: any): void {
    this.setStyle({ color: state });
  }
}

@inject(IInjector)
@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
class MyWarehouse extends EssWarehouse {
  async layout(data: any) {
    const point = new basic.Circle([0, 0], { radius: 60, color: 'red' });
    this.add('point', point);

    await this.imageManager.load(SVG_KUBOT, SVG_KUBOT_RED);

    const g0 = this.injector.$new(basic.Group, [], { pane: 'group01' });

    // performance
    for (let i = 0; i < 4000; i++) {
      const layer =
        Math.random() > 0.5
          ? new Circle1(randomLatLng(7000), {
              radius: 100,
              color: randomColor(),
              fill: true,
            })
          : new RECT(randomLatLng(7000), 300, 300, { fill: true, color: randomColor() });
      g0.addChild(layer);
    }

    this.map.addLayer(g0);

    // g0.translate(3000, 6000)

    loop(
      () => {
        g0.rotate(0.1);
        g0.scales(1.01);
      },
      {
        auto: true,
        duration: 30,
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
      <FPS />
      <Scene modes flex={1} warehouse={warehouse} />
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
