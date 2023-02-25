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
    this.add('point', this.create(MyPoint, -1000, -1000));
  }
}

interface MyPointState {
  type: string;
}

class MyPoint
  extends wikui.Circle<MyPointState>
  implements OnClick, OnMouseOverOut<string>, OnSelect<any>
{
  constructor(lat, lng) {
    super([lat, lng], {
      radius: 3000,
      stroke: true,
      color: '#098',
      fillColor: '#123',
      opacity: 0.5,
      weight: 40,
      fillOpacity: 0.4,
      fill: true,
    });

    this.layerState = {
      type: 'red',
    };
  }

  onSelect(data?: any): any {
    console.log('select');
    const fill = this.options.fillColor;
    const r = this.options.radius;
    const s = this.options.stroke;

    this.setStyle({ fillColor: 'blue', stroke: false });
    this.setRadius(r * 3);

    const pos = this.position.clone();
    this.translate(300, 600);

    return { fill, pos, r, s };
  }

  onSelected(): void {
    // this.openPopup();
    console.log('yeah!');

    this.line = L.polyline(
      [
        [0, 0],
        [1000, 3000],
        [455, 10],
      ],
      { weight: 3, color: '#000' },
    ).addTo(this._map);
  }

  private line = null;

  onUnSelected(): void {
    this.line.remove();

    this.line = null;
    console.log(' hsa yeah!');
  }

  onUnSelect(state?: any, data?: any): void {
    console.log('un select');
    this.setStyle({ fillColor: state.fill, stroke: state.s });
    this.setPosition(state.pos);
    this.setRadius(state.r);
  }

  onHover(data?: any): any {
    console.log('hover');
    const fill = this.options.fillColor;
    const r = this.options.radius;

    this.setStyle({ fillColor: 'green' });
    this.setRadius(r * 10);

    return { fill, r };
  }

  onUnHover(state?: any, data?: any): void {
    console.log('un hover');
    this.setStyle({ fillColor: state.fill });
    this.setRadius(state.r);
  }

  onLayerStateUpdate(previousState: unknown): void {
    console.log('state updated...');
    const { type } = this.layerState;
    this.setStyle({ fillColor: type });
  }

  onClick(e?: unknown): void {
    console.log('clicked');
    this.setLayerState({
      type: randomColor(),
    });
  }
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

const Aside = (props: wikdom.MultipleObjectsSelectProps<any>) => {
  return <div>{props.model?.length} selected</div>;
};

const Aside2 = (props: wikdom.ObjectSelectProps<any>) => {
  return <div>.. selected</div>;
};
