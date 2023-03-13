import L from 'leaflet';
import { wik, wikdom, wikui, wikutil } from '@/i2d';
import { OnClick, OnMouseOverOut, OnSelect } from '@/interfaces';
import { random2, range } from '@/utils';
import { randomLatLng } from '@/2d/utils';
import { Group } from '@/2d';

wik.configProviders('root', {
  [wik.interfaces.IGlobalConstManager]: wik.GlobalConstManager,
  [wik.interfaces.ILogger]: { useFactory: () => console },
  [wik.interfaces.ISelectionManager]: wikui.SelectionManager,
});

@wik.inject(wik.interfaces.IInjector)
@wik.provides(wikui.const$$.default_warehouse_deps)
class MyWarehouse extends wikui.WikWarehouse<{}, 'group'> {
  async layout(data: any) {
    await this.imageManager.load(wikui.images.SVG_CHARGEPILE, wikui.images.SVG_CHARGEPILE);

    const list = this.regList('group', { rendererBy: 'group', pane: 'groupAll' });

    const group = this.create(MyGroup, [], { needOverlay: true });
    const group2 = this.create(MyGroup, [], { needOverlay: true });

    this.add('group', group);
    this.add('group', group2);

    range(20, (i) => {
      range(20, (j) => {
        const bot3 = this.create(MyRobot, { type: 'kubo' });
        bot3.setPosition([1000 + j * 1000, -1000 - i * 1000]);
        if (i % 2 === 0) {
          group.addChild(bot3);
        } else {
          group2.addChild(bot3);
        }
      });
    });

    group2.addChild(this.create(MyMarker, [9000, 9000]));

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

class MyGroup extends Group implements OnSelect, OnClick {
  onSelect(data?: any) {}
  onUnSelect(state?: any, data?: any): void {}
  onClick(e?: unknown): void {
    console.log('clickded');
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

class MyRobot extends wikui.Robot implements OnMouseOverOut, OnSelect {
  onSelect(data?: any) {
    console.log('select child');
    this.setSVGStyle({ fill: '#1f0' });
  }

  onUnSelect(state?: any, data?: any): void {
    console.log('un select child');
    this.setSVGStyle({ fill: '' });
  }

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
