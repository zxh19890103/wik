import L from 'leaflet';
import THREE, { Material, MeshPhongMaterial } from 'three';
import { EssWarehouse } from '../2d';
import { DEFAULT_WAREHOUSE_DEPENDENCIES } from '../2d/basic';
import { inject, provides, View } from '../model/basic';
import Interface from '../interfaces/symbols';
import { Warehouse3D } from '../3d/Warehouse.class';
import './ioc.config';
import * as General from '../dom/general';
import { Rectangle } from '../2d/basic';
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
import { ObjectSelectProps } from '../dom/general';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@inject(Interface.IInjector)
@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
class MyWarehouse extends EssWarehouse {
  async layout(data: any) {
    const icon = 'https://cdn.iconscout.com/icon/premium/png-512-thumb/robotic-arm-51-1126917.png';

    await this.imageManager.load(icon);

    const material = { color: '#013faf', fill: true };

    for (let x = -2; x < 2; x++) {
      for (let y = -2; y < 2; y++) {
        const origin = [y * 220, x * 200] as L.LatLngExpression;
        const dot = new Rectangle(origin, 200, 60, { ...material });
        this.add('point', dot);
      }
    }

    this.map.setView([0, 0], 4);
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

  instPack: model3d.InstancePack;
  instBoard: model3d.InstanceBoard;

  constructor(injector: IInjector) {
    super();
    this.injector = injector;

    this.shelfs = this.addList('shelf');
    this.packs = this.addList('pack');
    this.boards = this.addList('board');
  }

  private lonelyRobot: THREE.Object3D = null;
  private walkX = 0;
  private walkY = 0;

  override onTick(): void {
    if (!this.lonelyRobot) return;
    this.lonelyRobot.position.set(this.walkX++, this.walkY++, 0);
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

      for (let x = -2; x < 2; x++) {
        for (let y = -2; y < 2; y++) {
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
            dot.py = y * 600;
            dot.pz = 400;
          }
        }
      }, 'size');
    }, 500);
  }, []);

  return (
    <General.World switch defaultKey="w2d">
      <General.Warehouse
        key="w2d"
        mvMappings={mvMapping}
        modes
        model={(injector) => injector.$new(MyWarehouse)}
      >
        <General.ViewSet type="dot" fit renderer="canvas" model={state.dots} />
      </General.Warehouse>
      <General.Warehouse3D
        key="w3d"
        mvMappings={mvMapping3}
        model={(injector) => injector.$new(MyWarehouse3D)}
      >
        <General.ViewSet3D type="dot" model={state.dots} />
      </General.Warehouse3D>
      <General.SelectShell w={300}>
        <Aside />
      </General.SelectShell>
    </General.World>
  );
};

const Aside = (props: ObjectSelectProps<View>) => {
  return <div>got one # {props.model?.model?.id}</div>;
};

const mvMapping = {
  dot: (m: model.Point, w: IWarehouse) => {
    return new Dot([m.py, m.px], { radius: 280 });
  },
};

class PackView extends Pack implements PointView, OnMouseOverOut, OnSelect {
  constructor(m: model.Point) {
    super({ x: m.px, y: m.py, z: m.pz }, { width: 300, height: 300, depth: 200 });
  }

  onSelect(data?: any) {
    const material = this.material as MeshPhongMaterial;
    const color = material.color.getHex();
    material.color.setHex(0xfff987);

    material.needsUpdate = true;
    return color;
  }

  onUnSelect(state?: any, data?: any): void {
    const material = this.material as MeshPhongMaterial;
    material.color.setHex(state);
    material.needsUpdate = true;
  }

  onHover(data?: any) {
    const material = this.material as MeshPhongMaterial;
    const color = material.color.getHex();
    material.color.setHex(0x0ff987);

    material.needsUpdate = true;
    return color;
  }

  onUnHover(state?: any, data?: any): void {
    const material = this.material as MeshPhongMaterial;
    material.color.setHex(state);
    material.needsUpdate = true;
  }

  model: model.Point;

  whenInit(): void {}
}

class RackView extends Shelf implements PointView {
  model: model.Point;
  whenInit(): void {
    throw new Error('Method not implemented.');
  }
  whenUnInit?(): void {
    throw new Error('Method not implemented.');
  }
  whenEffect?(effect: string): void {
    throw new Error('Method not implemented.');
  }
}

const mvMapping3 = {
  dot: (m: model.Point, w: IWarehouse) => {
    return new PackView(m);
  },
};

class Dot extends L.Circle implements PointView, OnSelect, OnContextMenu, OnMouseOverOut {
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
