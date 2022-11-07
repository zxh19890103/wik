import L from 'leaflet';
import THREE from 'three';
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
import * as meta from '../model/meta';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@inject(Interface.IInjector)
@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
class MyWarehouse extends EssWarehouse {
  async layout(data: any) {
    const icon = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/robotic-arm-51-1126917.png';

    await this.imageManager.load(icon);

    const material = { color: '#013faf', fill: true };

    for (let x = -20; x < 20; x++) {
      for (let y = -20; y < 20; y++) {
        const origin = [y * 220, x * 200] as L.LatLngExpression;
        const dot = new Rectangle(origin, 200, 60, { ...material });
        this.add('point', dot);
      }
    }

    this.map.setView([0, 0], 4);
  }
}

@inject(Interface.IInjector)
class MyWarehouse3D extends Warehouse3D {
  /**
   * just frames of rack.
   */
  shelfs: Object3DList<model3d.Shelf>;
  /**
   * packages
   */
  packs: Object3DList<model3d.InstancePack>;
  /**
   * boards on shelf.
   */
  boards: Object3DList<model3d.InstanceBoard>;

  instPack: model3d.InstancePack;
  instBoard: model3d.InstanceBoard;

  constructor(injector: IInjector) {
    super();
    this.injector = injector;

    this.shelfs = this.addList('shelf');
    this.packs = this.addList('pack');
    this.boards = this.addList('board');
  }

  layout(data?: unknown): void | Promise<void> {
    {
      const shelfSpec: meta.Rack = {
        width: 200,
        depth: 60,
        height: 500,
        heightPerLayer: 50,
        distanceOffGround: 10,
      };

      const packSpec: meta.Pack = {
        width: 40,
        depth: 60,
        height: 30,
      };

      const boardSpec: meta.Board = {
        width: 200,
        depth: 60,
      };

      const packs = new model3d.InstancePack(1000000, packSpec);
      const boards = new model3d.InstanceBoard(100000, boardSpec);

      for (let x = -10; x < 10; x++) {
        for (let y = -10; y < 10; y++) {
          const origin = { x: x * 210, y: y * 200, z: 10 };
          const shelf = new model3d.Shelf(origin, shelfSpec);

          for (const slot of shelf.getPackSlots(packSpec)) {
            packs.putAt(slot);
          }

          for (const slot of shelf.getBoardSlots()) {
            boards.putAt(shelf, slot);
          }

          this.shelfs.add(shelf);
        }
      }

      this.boards.add(boards);
      this.packs.add(packs);

      this.instBoard = boards;
      this.instPack = packs;
    }
  }
}

export default () => {
  return (
    <General.World>
      {/* <General.Warehouse model={(injector) => injector.$new(MyWarehouse)} /> */}
      <General.Warehouse3D model={(injector) => injector.$new(MyWarehouse3D)} />
    </General.World>
  );
};
