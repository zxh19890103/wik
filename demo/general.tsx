import L from 'leaflet';
import { EssWarehouse, DEFAULT_WAREHOUSE_DEPENDENCIES } from '../2d';
import { inject, provides } from '../model/basic';
import { IInjector } from '../interfaces/symbols';
import { Warehouse3D } from '../3d/Warehouse.class';
import THREE from 'three';
import './ioc.config';
import * as General from '../dom/general';
import { Rectangle } from '../2d/basic';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@inject(IInjector)
@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
class MyWarehouse extends EssWarehouse {
  async layout(data: any) {
    const icon = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/robotic-arm-51-1126917.png';

    await this.imageManager.load(icon);

    // const bot = this.injector.$new<Bot>(Bot, this.imageManager.get(icon), 1000, 1000);
    // this.add('bot', bot);

    const material = { color: 'green', fill: true };

    for (let x = -20; x < 20; x++) {
      for (let y = -20; y < 20; y++) {
        const dot = new Rectangle([y * 50, x * 50], 20, 20, { ...material });
        this.add('point', dot);
      }
    }

    this.map.setView([0, 0], 4);
  }
}

@inject(IInjector)
class MyWarehouse3D extends Warehouse3D {
  layout(data?: unknown): void | Promise<void> {
    const scene = this.scene;

    const group = new THREE.Group();
    group.position.set(0, 0, 100);

    // shelfs
    {
      const material = new THREE.MeshPhongMaterial({
        color: 0x00ff0f,
        transparent: true,
        blendDstAlpha: 0.4,
      });

      for (let x = -20; x < 20; x++) {
        for (let y = -20; y < 20; y++) {
          for (let z = 0; z < 7; z++) {
            const box = new THREE.Mesh(new THREE.BoxGeometry(20, 20, 20), material);
            box.position.set(x * 100, y * 50, z * 25);
            group.add(box);
          }
        }
      }
    }

    scene.add(group);
  }
}

export default () => {
  return (
    <General.World>
      <General.Warehouse model={(injector) => injector.$new(MyWarehouse)} />
      <General.Warehouse3D model={(injector) => injector.$new(MyWarehouse3D)} />
    </General.World>
  );
};