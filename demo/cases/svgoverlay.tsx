import L from 'leaflet';
import { wik, wikdom, wikui, wikutil } from '@/i2d';

import { OnClick, OnMouseOverOut, OnSelect } from '@/interfaces';
import { ReactiveLayerRenderEffect } from '@/mixins';
import { randomColor } from '@/utils';

wik.configProviders('root', {
  [wik.interfaces.IGlobalConstManager]: wik.GlobalConstManager,
  [wik.interfaces.ILogger]: { useFactory: () => console },
});

@wik.inject(wik.interfaces.IInjector)
@wik.provides(wikui.const$$.default_warehouse_deps)
class MyWarehouse extends wikui.WikWarehouse {
  async layout(data: any) {
    this.add('chargepile', new Circle());
  }
}

const SVG = wikui.SvgComponentFactory<{}>((props) => {
  return <circle fill="#fff" cx={1500} cy={1500} r={1500} />;
}, 'Circle');

class Circle extends wikui.ReactSVGOverlay implements OnClick {
  constructor() {
    super(SVG, [0, 0], 3000, 3000, null);
  }

  count = 0;

  onClick(e?: unknown): void {
    this.setScale(2);
    this.count += 1;
  }
}

const createSvgElement = () => {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  el.setAttribute('viewBox', '0 0 100 100');
  el.setAttribute('version', '1.1');
  el.innerHTML = '<circle cx="50" cy="50" r="50" fill="#fff" />';
  return el;
};

export default () => {
  return (
    <wikdom.World defaultKeys={['2d']}>
      <wikdom.Warehouse key="2d" modes warehouse={MyWarehouse} />
      {/* <wikdom.MultipleSelectShell w={400}>
        <Aside />
      </wikdom.MultipleSelectShell>
      <wikdom.SelectShell w={300}>
        <Aside2 />
      </wikdom.SelectShell> */}
    </wikdom.World>
  );
};
