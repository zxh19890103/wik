import { IInjector } from '@/interfaces';
import * as meta from '@/model/meta';
import { useEffect, useState } from 'react';

import { wik, wikdom, wikui, wikutil } from '@/i3d';

wik.configProviders('root', {
  [wik.interfaces.IGlobalConstManager]: wik.GlobalConstManager,
  [wik.interfaces.ILogger]: { useFactory: () => console },
});

@wik.inject(wik.interfaces.IInjector)
@wik.provides({
  [wik.interfaces.IModeManager]: wik.ModeManager,
})
class MyWarehouse3D extends wikui.Warehouse3D {
  /**
   * just frames of rack.
   */
  shelfs: wikui.Object3DList<wikui.Shelf>;
  /**
   * packages
   */
  packs: wikui.Object3DList<wikui.InstancePack>;
  /**
   * boards on shelf.
   */
  boards: wikui.Object3DList<wikui.InstanceBoard>;

  racks: wikui.Object3DList<wikui.InstancedRack>;

  robots: wikui.Object3DList<wikui.Robot>;

  instancedPack: wikui.InstancePack;
  instancedBoard: wikui.InstanceBoard;

  constructor(injector: IInjector) {
    super();

    this.assign('injector', injector);

    this.shelfs = this.regList('shelf');
    this.packs = this.regList('pack');
    this.boards = this.regList('board');
    this.racks = this.regList('rack');

    this.robots = this.regList('robot');
  }

  async layout(data: any) {
    const pack = new wikui.InstancePack(1000000, packSpec);
    const board = new wikui.InstanceBoard(100000, boardSpec);

    this.packs.add(pack);
    this.boards.add(board);

    this.instancedBoard = board;
    this.instancedPack = pack;

    this.robots.add(new MyRobot());
  }
}

class MyRobot extends wikui.Robot {
  constructor() {
    super();
    console.log('...');
  }
}

export default () => {
  const [state] = useState(() => {
    return {
      dots: new wik.List(wik.Point, []),
    };
  });

  useEffect(() => {
    setTimeout(() => {
      wik.__batched_fires__(() => {
        // 400 dots
        for (let x = 0; x < 100; x++) {
          for (let y = 0; y < 100; y++) {
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
    <wikdom.World defaultKeys={['w3d']}>
      <wikdom.Warehouse3D key="w3d" modes mvMappings={mvMapping3} warehouse={MyWarehouse3D}>
        <wikdom.ViewSet3D type="rack" model={state.dots} />
      </wikdom.Warehouse3D>
      <wikdom.SelectShell w={300}>
        <Aside />
      </wikdom.SelectShell>
    </wikdom.World>
  );
};

const Aside = (props: wikdom.ObjectSelectProps<wik.View>) => {
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

class RackView extends wikui.Shelf implements wik.PointView, wik.WithWarehouseRef<MyWarehouse3D> {
  model: wik.Point;
  $$warehouse: MyWarehouse3D;

  constructor(m: wik.Point) {
    super({ x: m.px, y: m.py, z: m.pz }, rackSpec);
  }

  whenInit(): void {
    const { instancedBoard, instancedPack } = this.$$warehouse;

    for (const slot of this.getPackSlots(packSpec)) {
      const instance = instancedPack.addInstance(slot.position);
      this.packs.push(instance);
    }

    instancedPack.requestUpdate();
  }

  whenUnInit?(): void {
    const { instancedBoard, instancedPack } = this.$$warehouse;

    for (const pack of this.packs) {
      pack.delete();
    }

    for (const board of this.boards) {
      board.delete();
    }
  }

  whenEffect?(effect: string): void {}
}

const mvMapping3 = {
  rack: (m: wik.Point, w: MyWarehouse3D) => {
    return new RackView(m);
  },
};
