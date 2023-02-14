import { useState } from 'react';
import * as wik2d from '@/2d';
import * as wikmodel from '@/model';
import * as wikdom from '@/dom';

import { OnClick, OnMouseOverOut, OnSelect } from '@/interfaces/Interactive';

import '../ioc.config';

@wikmodel.inject(wikmodel.interfaces.IInjector)
@wikmodel.provides(wik2d.const$$.DEFAULT_WAREHOUSE_DEPENDENCIES)
class MyWarehouse extends wik2d.EssWarehouse {
  async layout(data: any) {
    await this.imageManager.load(wik2d.images.SVG_KUBOT, wik2d.images.SVG_KUBOT_RED);

    const bot = this.injector.$new<wik2d.Bot>(
      wik2d.Bot,
      this.imageManager.get(wik2d.images.SVG_KUBOT_RED),
      1000,
      1000,
    );
    this.add('bot', bot);

    const n = 100; // 400 * 400 = 16 00000

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        this.add('point', new MyPoint(i * 400, j * 400));
      }
    }
  }
}

class MyPoint extends wik2d.Circle implements OnSelect, OnClick, OnMouseOverOut {
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
    return wikmodel.rootInjector.$new(MyWarehouse) as MyWarehouse;
  });

  return (
    <wikdom.World defaultKeys={['2d']}>
      <wikdom.Warehouse key="2d" modes warehouse={warehouse} />
      <wikdom.MultipleSelectShell w={400}>
        <Aside />
      </wikdom.MultipleSelectShell>
      <wikdom.SelectShell w={300}>
        <Aside2 />
      </wikdom.SelectShell>
    </wikdom.World>
  );
};

const Aside = (props: wikdom.MultipleObjectsSelectProps<any>) => {
  return <div>{props.model?.length} selected</div>;
};

const Aside2 = (props: wikdom.ObjectSelectProps<any>) => {
  return <div>.. selected</div>;
};
