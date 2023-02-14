import { configProviders, inject, List, provides, View } from '@/model/basic';
import Interface from '@/model/symbols';
import { Warehouse3D } from '@/3d/Warehouse.class';

import * as model3d from '@/3d';
import { Object3DList } from '@/3d/Object3DList.class';
import { IInjector } from '@/interfaces/Injector';
import * as meta from '@/model/meta';
import { useEffect, useState } from 'react';
import { __batched_fires__ } from '@/model/basic/Emitter';
import { PointView } from '@/model/PointView';
import { WithWarehouseRef } from '@/model/IWarehouseObjectList';
import { queueTask } from '@/utils/queueTask';
import * as Interfaces from '@/model/symbols';

import * as wik from '@/dom/3d';
import * as model from '@/model';

configProviders('root', {
  [Interfaces.IGlobalConstManager]: model.state.GlobalConstManager,
  [Interfaces.ILogger]: { useFactory: () => console },
});

@inject(Interface.IInjector)
@provides({
  [Interfaces.IModeManager]: model.modes.ModeManager,
})
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

  async layout(data: any) {}
}

export default () => {
  const [state] = useState(() => {
    return {
      dots: new List(model.Point, []),
    };
  });

  useEffect(() => {
    setTimeout(() => {
      __batched_fires__(() => {
        // 400 dots
        for (let x = 0; x < 4; x++) {
          for (let y = 0; y < 3; y++) {
            const dot = state.dots.create();
            dot.px = x * 2000;
            dot.py = y * 2000;
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
      <wik.SelectShell w={300}>
        <Aside />
      </wik.SelectShell>
    </wik.World>
  );
};

const Aside = (props: wik.ObjectSelectProps<View>) => {
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
  width: 380,
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
