import L from 'leaflet';
import { EssWarehouse } from '../../2d';
import { DEFAULT_WAREHOUSE_DEPENDENCIES } from '../../2d/basic';
import { inject, provides, View } from '../../model/basic';
import Interface from '../../interfaces/symbols';
import { Warehouse3D } from '../../3d/Warehouse.class';
import '../ioc.config';
import * as wik from '../../dom/general';
import * as model2d from '../../2d';
import * as model3d from '../../3d';
import { Object3DList } from '../../3d/Object3DList.class';
import { IInjector } from '../../interfaces/Injector';
import * as meta from '../../model/meta';
import { useEffect, useState } from 'react';
import * as model from '../../model';
import { __batched_fires__ } from '../../mixins/Emitter';
import { IWarehouse } from '../../model';
import { PointView } from '../../model/PointView';
import { ContextMenuItem } from '../../interfaces/types';
import { OnContextMenu, OnMouseOverOut, OnSelect } from '../../interfaces/Interactive';
import { MvMappings, ObjectSelectProps } from '../../dom/general';
import { WithWarehouseRef } from '../../model/IWarehouseObjectList';
import { queueTask } from '../../utils';

@inject(Interface.IInjector)
@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
class MyWarehouse extends EssWarehouse {
  async layout2(data: any) {
    this.modeManager.mode = 'default';
  }

  async layout(data?: any): Promise<void> {
    // this.map.setView([0, 0], 4);
    this.modeManager.mode = 'default';
  }
}

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
  instancedRack: model3d.InstancedRack;

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

    const rackSpec = {
      width: 1655,
      depth: 655,
      height: 3400,
      heightPerLayer: 360,
      distanceOffGround: 20,
    };

    this.instancedRack = new model3d.InstancedRack(100000, rackSpec);

    this.racks.add(this.instancedRack);
  }

  async layout(data: any) {
    {
      const racks = await fetch('/__data__/racks.json').then((r) => r.json());

      for (const rack of racks) {
        if (rack.a === null || rack.t === 90 || rack.t === 270) continue;

        this.instancedRack.addInstance({
          x: rack.xC - 10000,
          y: rack.yC - 20000,
          z: 0,
        });
      }

      this.instancedRack.updateInstances();
    }

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
        for (let x = 0; x < 1; x++) {
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
    <wik.World switch defaultKeys={['w3d']}>
      <wik.Warehouse
        key="w2d"
        mvMappings={mvMapping}
        modes
        warehouse={(injector) => injector.$new(MyWarehouse)}
      >
        <wik.ViewSet type="rack" fit renderer="canvas" model={state.dots} />
      </wik.Warehouse>
      <wik.Warehouse3D
        key="w3d"
        modes
        mvMappings={mvMapping3}
        warehouse={(injector) => injector.$new(MyWarehouse3D)}
      >
        <wik.ViewSet3D type="rack" model={state.dots} />
      </wik.Warehouse3D>
      <wik.SelectShell w={300}>
        <Aside C={model3d.InstancePack}>
          <button
            onClick={() => {
              const dot = state.dots.create();
              dot.px = Math.random() * 3000;
              dot.py = Math.random() * 3000;
              dot.pz = 0;
            }}
          >
            add
          </button>
        </Aside>
      </wik.SelectShell>
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

const mvMapping = {
  rack: (m: model.Point, w: IWarehouse) => {
    return new Rack2dView([m.py, m.px], rackSpec);
  },
};

class RackView extends model3d.Shelf implements PointView, WithWarehouseRef<MyWarehouse3D> {
  model: model.Point;
  $$warehouse: MyWarehouse3D;

  constructor(m: model.Point) {
    super({ x: m.px, y: m.py, z: m.pz }, rackSpec);
  }

  whenInit(): void {
    const { instancedBoard, instancedPack } = this.$$warehouse;

    for (const slot of this.getBoardSlots()) {
      const instance = instancedBoard.addInstance(slot.position, 0x9088f6);
      this.boards.push(instance);
    }

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

class Rack2dView
  extends model2d.Shelf
  implements PointView, OnSelect, OnContextMenu, OnMouseOverOut
{
  model: model.Point;

  onHover() {
    const c = this.options.color;
    this.setStyle({ color: '#000' });
    return c;
  }

  onUnHover(state?: any): void {
    this.setStyle({ color: state });
  }

  onContextMenu(evt?: L.LeafletMouseEvent): ContextMenuItem[] {
    return [{ text: 'Del', value: 'delete' }];
  }

  onContextMenuClick(key: string): void | Promise<any> {
    if (key === 'delete') {
      this.model.remove();
    }
  }

  whenInit(): void {}

  whenEffect?(effect: string): void {}

  onSelect() {
    const color = this.options.color;
    this.setStyle({ color: '#f12' });
    return color;
  }

  onUnSelect(state?: any): void {
    this.setStyle({ color: state });
  }
}
