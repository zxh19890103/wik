import L from 'leaflet';
import { wik, wikdom, wikui, wikutil } from '@/i2d';

import { OnClick, OnMouseOverOut, OnSelect } from '@/interfaces';
import { ReactiveLayerRenderEffect } from '@/mixins';
import { random2, randomColor, range } from '@/utils';

wik.configProviders('root', {
  [wik.interfaces.IGlobalConstManager]: wik.GlobalConstManager,
  [wik.interfaces.ILogger]: { useFactory: () => console },
});

@wik.inject(wik.interfaces.IInjector)
@wik.provides(wikui.const$$.default_warehouse_deps)
class MyWarehouse extends wikui.WikWarehouse {
  async layout(data: any) {
    range(400, (i) => {
      this.add(
        'chargepile',
        new Circle(random2(-1500, 1500), random2(-50000, 50000), random2(0, 360), randomColor()),
      );
    });

    this.add('point', new wikui.Circle([0, 0]));
  }
}

interface CircleSvgData {
  color: string;
}

const SVG = wikui.cSvgFc<CircleSvgData, Circle>((props) => {
  const { data, sX, sY } = props;

  return <rect fill={data.color} x={0} y={0} width={sX} height={sY} />;
}, 'Circle');

class Circle
  extends wikui.ReactSVGOverlay<CircleSvgData>
  implements OnSelect, OnClick, OnMouseOverOut
{
  constructor(lat, lng, a, color) {
    super(SVG, [lat, lng], 3000, 3000, null);
    this.angle = a;
    this.svgStyleElement = 'rect';
    this.svgData = { color: randomColor() };
    this.svgStyle = { fill: color, fillOpacity: 0.54, strokeWidth: 10 };
  }

  onSelect(data?: any) {
    const fill = this.svgStyle.fill;
    this.setSVGStyle({ fill: '#a10' });
    return fill;
  }

  onUnSelect(state?: any, data?: any): void {
    console.log('unselected?');
    this.setSVGStyle({ fill: state });
  }

  onHover(data?: any) {
    const fill = this.svgStyle.fill;
    this.setSVGStyle({ fill: '#f90' });
    this.rotate(45);
    return fill;
  }

  onUnHover(state?: any, data?: any): void {
    this.setSVGStyle({ fill: state });
    this.rotate(-45);
  }

  onClick(e?: unknown): void {}
}

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
