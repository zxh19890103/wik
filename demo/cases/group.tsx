import L from 'leaflet';
import { wik, wikdom, wikui, wikutil } from '@/i2d';
import { OnMouseOverOut } from '@/interfaces';
import { random2, range } from '@/utils';
import { randomLatLng } from '@/2d/utils';

wik.configProviders('root', {
  [wik.interfaces.IGlobalConstManager]: wik.GlobalConstManager,
  [wik.interfaces.ILogger]: { useFactory: () => console },
});

@wik.inject(wik.interfaces.IInjector)
@wik.provides(wikui.const$$.default_warehouse_deps)
class MyWarehouse extends wikui.WikWarehouse<{}, 'group'> {
  async layout(data: any) {
    await this.imageManager.load(wikui.images.SVG_CHARGEPILE, wikui.images.SVG_CHARGEPILE);

    const group = this.create(wikui.Group, [], { needOverlay: true });
    this.scene.addLayer(group);

    range(10, (i) => {
      range(20, (j) => {
        const bot3 = this.create(MyRobot, { type: 'kubo' });
        bot3.setPosition([1000 + j * 1000, -1000 - i * 1000]);
        group.addChild(bot3);
      });
    });

    group.addChild(this.create(MyMarker, [9000, 9000]));

    const n = 2;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        group.addChild(this.create(MyPoint, i * 400, j * 400));
      }
    }

    // setTimeout(() => {
    //   group.remove();

    //   setTimeout(() => {
    //     group.addTo(this.scene);
    //   }, 3000);
    // }, 10000);
  }
}

class MyPoint extends wikui.Circle implements OnMouseOverOut {
  constructor(lat, lng) {
    super([lat, lng], { color: '#f91', opacity: 0.1, fill: true, fillOpacity: 0.5 });
  }

  onHover(data?: any) {
    this.setStyle({ color: '#010' });
  }

  onUnHover(state?: any, data?: any): void {
    this.setStyle({ color: '#f91' });
  }
}

class MyMarker extends wikui.Marker implements OnMouseOverOut {
  onHover(data?: any) {
    this.setOpacity(0.3);
  }

  onUnHover(state?: any, data?: any): void {
    this.setOpacity(1);
  }
}

class MyRobot extends wikui.Robot implements OnMouseOverOut {
  onHover(data?: any) {
    const angle = this.angle;
    const posi = this.position;
    const [lat, lng] = randomLatLng(10000);
    this.translate(lat, lng);
    this.rotate(random2(-180, 180));
    return { angle, posi };
  }

  onUnHover(state?: any, data?: any): void {
    this.setPosition(state.posi);
    this.setAngle(state.angle);
  }
}

export default () => {
  return (
    <wikdom.World defaultKeys={['2d']}>
      <wikdom.Warehouse key="2d" modes warehouse={MyWarehouse} />
    </wikdom.World>
  );
};

const Aside = (props: wikdom.MultipleObjectsSelectProps<any>) => {
  return <div>{props.model?.length} selected</div>;
};

const Aside2 = (props: wikdom.ObjectSelectProps<MyPoint>) => {
  return <div>.. selected</div>;
};
