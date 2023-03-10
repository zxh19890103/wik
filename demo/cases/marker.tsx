import L from 'leaflet';
import { wik, wikdom, wikui, wikutil } from '@/i2d';

wik.configProviders('root', {
  [wik.interfaces.IGlobalConstManager]: wik.GlobalConstManager,
  [wik.interfaces.ILogger]: { useFactory: () => console },
});

@wik.inject(wik.interfaces.IInjector)
@wik.provides(wikui.const$$.default_warehouse_deps)
class MyWarehouse extends wikui.WikWarehouse {
  async layout(data: any) {
    await this.imageManager.load(wikui.images.SVG_CHARGEPILE, wikui.images.SVG_CHARGEPILE);

    const bot = this.create(
      wikui.Bot,
      this.imageManager.get(wikui.images.SVG_CHARGEPILE),
      1000,
      1000,
    );

    this.add('bot', bot);
    this.add('point', this.create(wikui.Circle, [0, 0]));

    const n = 1;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        this.add('location', this.create(MyPoint, i * 400, j * 400));
        // L.circle([i * 400, j * 400], { radius: 100 }).addTo(this.scene);
      }
    }
  }
}

class MyPoint extends wikui.Marker {
  constructor(lat, lng) {
    super([lat, lng], { opacity: 0.1 });
  }
}

export default () => {
  return (
    <wikdom.World defaultKeys={['2d']}>
      <wikdom.Warehouse key="2d" modes warehouse={MyWarehouse} />
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

const Aside2 = (props: wikdom.ObjectSelectProps<MyPoint>) => {
  return <div>.. selected</div>;
};
