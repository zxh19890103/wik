import { useState } from 'react';
import { EssWarehouse, basic, Bot } from '@/2d';
import { inject, rootInjector, provides } from '@/model/basic';
import { IInjector } from '@/interfaces/symbols';

import * as wik from '@/dom';
import { SVG_KUBOT, SVG_KUBOT_RED } from '@/2d/images';
import { OnClick, OnMouseOverOut, OnSelect } from '@/interfaces/Interactive';

import '../ioc.config';

@inject(IInjector)
@provides(basic.DEFAULT_WAREHOUSE_DEPENDENCIES)
class MyWarehouse extends EssWarehouse {
  async layout(data: any) {
    await this.imageManager.load(SVG_KUBOT, SVG_KUBOT_RED);

    const bot = this.injector.$new<Bot>(Bot, this.imageManager.get(SVG_KUBOT_RED), 1000, 1000);
    this.add('bot', bot);

    const n = 100; // 400 * 400 = 16 00000

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        this.add('point', new Point(i * 400, j * 400));
      }
    }
  }
}

class Point extends basic.Circle implements OnSelect, OnClick, OnMouseOverOut {
  color = '#097';

  constructor(lat, lng) {
    super([lat, lng], { radius: 100, stroke: false, color: '#098', fillColor: '#123', fill: true });
    this.color = this.options.color;
  }
  onHover(data?: any) {
    this.setStyle({ fillColor: '#098' });
  }

  onUnHover(state?: any, data?: any): void {
    this.setStyle({ fillColor: '#123' });
  }

  onClick(e?: unknown): void {
    // alert('clicked');
  }

  onSelect(data?: any) {
    this.setStyle({ fillColor: 'red' });
  }

  onUnSelect(state?: any, data?: any): void {
    this.setStyle({ fillColor: '#098' });
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
      <wik.SelectShell w={300}>
        <Aside2 />
      </wik.SelectShell>
    </wik.World>
  );
};

const Aside = (props: wik.MultipleObjectsSelectProps<any>) => {
  return <div>{props.model?.length} selected</div>;
};

const Aside2 = (props: wik.ObjectSelectProps<any>) => {
  return <div>.. selected</div>;
};
