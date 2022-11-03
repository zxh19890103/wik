import L from 'leaflet';
import THREE, { BoxGeometry, Mesh } from 'three';
import { EssWarehouse } from '../2d';
import { DEFAULT_WAREHOUSE_DEPENDENCIES } from '../2d/basic';
import { inject, provides } from '../model/basic';
import Interface from '../interfaces/symbols';
import { Warehouse3D } from '../3d/Warehouse.class';
import './ioc.config';
import * as General from '../dom/general';
import { Rectangle } from '../2d/basic';
import * as model3d from '../3d';
import { Object3DList } from '../3d/Object3DList.class';
import { IInjector } from '../interfaces/Injector';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@inject(Interface.IInjector)
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

@inject(Interface.IInjector)
class MyWarehouse3D extends Warehouse3D {
  shelfs: Object3DList<model3d.Shelf>;

  constructor(injector: IInjector) {
    super();
    this.injector = injector;
    this.shelfs = this.addList('shelf');
  }

  layout(data?: unknown): void | Promise<void> {
    // const group = new THREE.Group();
    // group.position.set(0, 0, 100);
    // shelfs

    // instantiate a loader
    // const loader = new THREE.MaterialLoader();

    // // load a resource
    // loader.load(
    //   // resource URL
    //   '/__data__/rack.obj',
    //   // called when resource is loaded
    //   (object) => {
    //     const a = new BoxGeometry(500, 500, 500);
    //     this.scene.add(new Mesh(a, object));
    //   },
    //   // called when loading is in progresses
    //   (xhr) => {
    //     console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    //   },
    //   // called when loading has errors
    //   (error) => {
    //     console.log('An error happened');
    //   },
    // );

    {
      for (let x = -20; x < 20; x++) {
        for (let y = -20; y < 20; y++) {
          for (let z = 0; z < 7; z++) {
            const shelf = new model3d.Shelf({ x: x * 100, y: y * 50, z: z * 25 });
            this.shelfs.add(shelf);
          }
        }
      }
    }
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
