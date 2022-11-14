import L from 'leaflet';
import THREE, { MeshPhongMaterial } from 'three';
import { EssWarehouse } from '../2d';
import { DEFAULT_WAREHOUSE_DEPENDENCIES } from '../2d/basic';
import { inject, provides, View } from '../model/basic';
import Interface from '../interfaces/symbols';
import { Warehouse3D } from '../3d/Warehouse.class';
import './ioc.config';
import * as wik from '../dom/general';
import * as model2d from '../2d';
import * as model3d from '../3d';
import { Object3DList } from '../3d/Object3DList.class';
import { IInjector } from '../interfaces/Injector';
import * as meta from '../model/meta';
import { useEffect, useState } from 'react';
import * as model from '../model';
import { __batched_fires__ } from '../mixins/Emitter';
import { IWarehouse } from '../model';
import { Pack, Shelf } from '../3d';
import { PointView } from '../model/PointView';
import { ContextMenuItem } from '../interfaces/types';
import { OnContextMenu, OnMouseOverOut, OnSelect } from '../interfaces/Interactive';
import { MvMappings, ObjectSelectProps } from '../dom/general';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

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

  instancedPack: model3d.InstancePack;
  instancedBoard: model3d.InstanceBoard;

  constructor(injector: IInjector) {
    super();
    this.injector = injector;

    this.shelfs = this.addList('shelf');
    this.packs = this.addList('pack');
    this.boards = this.addList('board');

    const pack = new model3d.InstancePack(1000000, packSpec);
    const board = new model3d.InstanceBoard(100000, boardSpec);

    this.packs.add(pack);
    this.boards.add(board);

    this.instancedBoard = board;
    this.instancedPack = pack;
  }

  layout(data?: unknown): void | Promise<void> {}
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
        for (let x = 0; x < 20; x++) {
          for (let y = 0; y < 20; y++) {
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
    <wik.World switch defaultKeys={['w2d', 'w3d']}>
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
        <Aside />
      </wik.SelectShell>
    </wik.World>
  );
};

const Aside = (props: ObjectSelectProps<View>) => {
  return <div>got one # {props.model?.model?.id}</div>;
};

const packSpec: meta.Pack = {
  width: 100,
  depth: 80,
  height: 80,
};

const rackSpec: meta.Rack = {
  width: 690,
  depth: 80,
  height: 500,
  heightPerLayer: 60,
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

class RackView extends model3d.Shelf implements PointView {
  model: model.Point;

  constructor(m: model.Point) {
    super({ x: m.px, y: m.py, z: m.pz }, rackSpec);
  }

  whenInit(): void {}
  whenUnInit?(): void {}
  whenEffect?(effect: string): void {}
}

const mvMapping3 = {
  rack: (m: model.Point, w: MyWarehouse3D) => {
    const view = new RackView(m);

    for (const slot of view.getBoardSlots()) {
      w.instancedBoard.putAt(slot);
    }

    // for (const slot of view.getPackSlots(packSpec)) {
    //   w.instancedPack.putAt(slot);
    // }

    w.instancedBoard.instanceMatrix.needsUpdate = true;

    return view;
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
