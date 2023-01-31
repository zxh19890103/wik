import L from 'leaflet';
import { DEFAULT_WAREHOUSE_DEPENDENCIES } from '../2d/basic';
import { inject, provides, View } from '../model/basic';
import Interface from '../interfaces/symbols';
import { Warehouse3D } from '../3d/Warehouse.class';
import './ioc.config';
import * as wik from '../dom/general';
import * as model3d from '../3d';
import { Object3DList } from '../3d/Object3DList.class';
import { IInjector } from '../interfaces/Injector';
import * as meta from '../model/meta';
import { useEffect, useState } from 'react';
import * as model from '../model';
import { __batched_fires__ } from '../mixins/Emitter';
import { PointView } from '../model/PointView';
import { ObjectSelectProps } from '../dom/general';
import { WithWarehouseRef } from '../model/IWarehouseObjectList';
import { queueTask } from '../utils';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@inject(Interface.IInjector)
@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
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

  racks: Object3DList<model3d.InstancedRack>;

  instancedPack: model3d.InstancePack;
  instancedBoard: model3d.InstanceBoard;

  constructor(injector: IInjector) {
    super();
    this.injector = injector;

    this.shelfs = this.addList('shelf');
    this.packs = this.addList('pack');
    this.boards = this.addList('board');
    this.racks = this.addList('rack');

    const pack = new model3d.InstancePack(1000000, packSpec);
    const board = new model3d.InstanceBoard(100000, boardSpec);

    this.packs.add(pack);
    this.boards.add(board);

    this.instancedBoard = board;
    this.instancedPack = pack;
  }

  async layout(data: any) {
    {
      // let total = 0;
      // console.time('location');
      // for (const location of data.location) {
      //   switch (location.locationTypeCode) {
      //     case 'LT_SHELF_STORAGE': {
      //       total += 1;
      //       this.makeLocation(location);
      //       break;
      //     }
      //     case 'LT_CHARGE': {
      //       break;
      //     }
      //     case 'LT_HAIPORT': {
      //       break;
      //     }
      //     case 'LT_LABOR': {
      //       break;
      //     }
      //     case 'LT_REST': {
      //       break;
      //     }
      //     case 'LT_MAINTAIN': {
      //       break;
      //     }
      //   }
      //   // if (total === 30) {
      //   //   break;
      //   // }
      // }
      // this.instancedPack.position.set(-10000, -20000, 0);
      // this.instancedPack.updateInstances();
      // console.timeEnd('location');
      // console.log('location total', total);
    }
  }

  getLayoutData(): Promise<any> {
    return fetch('/__data__/xianbei').then((r) => r.json());
  }

  private makePoint(data) {
    const { position } = data;
  }

  private makeLocation(data) {
    const { position } = data;
    const theta = data.link[0]?.container2mapTheta || '0';
    const { x, y, z } = position;
    // const identity = `${x},${y},${theta}`;
    // 0,90,180,270,
    const translation = { y: +y, x: +x, z: +z };
    const rotation = { z: 0 };

    if (theta === '270') {
      translation.y -= 460;
      rotation.z = Math.PI * 0.5;
    } else if (theta === '180') {
      translation.x += 460;
      rotation.z = Math.PI * 0.5;
    } else if (theta === '90') {
      translation.y += 460;
      rotation.z = Math.PI * 1.5;
    } else {
      translation.x -= 460;
      rotation.z = Math.PI * 1.5;
    }

    const instance = this.instancedPack.addInstance(
      translation,
      rotation.z,
      Math.random() * 0xffffff,
    );

    instance.model = data;
  }
}

export default () => {
  const [state] = useState(() => {
    return {
      dots: new model.basic.List(model.Point, []),
    };
  });

  useEffect(() => {
    setTimeout(() => {
      __batched_fires__(() => {
        // 400 dots
        for (let x = 0; x < 4; x++) {
          for (let y = 0; y < 3; y++) {
            const dot = state.dots.create();
            dot.px = x * 700;
            dot.py = y * 190;
            dot.pz = 0;
          }
        }
      }, 'size');
    }, 500);
  }, []);

  return (
    <wik.World defaultKeys={['w3d']}>
      <wik.Warehouse3D
        key="w3d"
        modes
        mvMappings={mvMapping3}
        warehouse={(injector) => injector.$new(MyWarehouse3D)}
      >
        <wik.ViewSet3D type="rack" model={state.dots} />
      </wik.Warehouse3D>
    </wik.World>
  );
};

const Aside = (props: ObjectSelectProps<View>) => {
  return (
    <div>
      got one # {props.C?.name} // {props.model?.id}
      <pre>{JSON.stringify(props.model.model, null, 2)}</pre>
      <hr />
      {props.children}
    </div>
  );
};

const packSpec: meta.Pack = {
  width: 400,
  depth: 400,
  height: 340,
};

const rackSpec: meta.Rack = {
  width: 1600,
  depth: 500,
  height: 3400,
  heightPerLayer: 360,
  distanceOffGround: 20,
};

const boardSpec: meta.Board = {
  width: 690,
  depth: 80,
};

class RackView extends model3d.Shelf implements PointView, WithWarehouseRef<MyWarehouse3D> {
  model: model.Point;
  $$warehouse: MyWarehouse3D;

  constructor(m: model.Point) {
    super({ x: m.px, y: m.py, z: m.pz }, rackSpec);
  }

  whenInit(): void {
    const { instancedBoard, instancedPack } = this.$$warehouse;

    // for (const slot of this.getBoardSlots()) {
    //   const instance = instancedBoard.addInstance(slot.position, 0x9088f6);
    //   this.boards.push(instance);
    // }

    for (const slot of this.getPackSlots(packSpec)) {
      const instance = instancedPack.addInstance(slot.position);
      this.packs.push(instance);
    }

    queueTask({
      key: 'updateInstances',
      run: () => {
        instancedPack.updateInstances();
        instancedBoard.updateInstances();
      },
    });
  }

  whenUnInit?(): void {
    const { instancedBoard, instancedPack } = this.$$warehouse;

    for (const pack of this.packs) {
      pack.delete();
    }

    for (const board of this.boards) {
      board.delete();
    }

    queueTask({
      key: 'updateInstances',
      run: () => {
        instancedPack.updateInstances();
        instancedBoard.updateInstances();
      },
    });
  }

  whenEffect?(effect: string): void {}
}

const mvMapping3 = {
  rack: (m: model.Point, w: MyWarehouse3D) => {
    return new RackView(m);
  },
};
