import L from 'leaflet';
import { EssWarehouse, basic, DEFAULT_WAREHOUSE_DEPENDENCIES, Warehouse } from '../2d';
import { Scene } from '../dom/Scene';
import { useState } from 'react';
import { inject, rootInjector, provides } from '../model/basic';
import { IInjector, IRedoUndoManager } from '../interfaces/symbols';
import { Bot } from '../2d/Bot.class';

import './ioc.config';
import { SVG_KUBOT, SVG_KUBOT_RED } from '../2d/images';
import { StateActionBase, StateActionManager } from '../model/state';
import { HrMap } from '../2d/basic';
import { randomLatLng } from '../utils';
import { ReactiveLayer } from '../mixins/ReactiveLayer';

L.Icon.Default.imagePath = 'http://wls.hairoutech.com:9100/fe-libs/leaflet-static/';

@inject(IInjector)
@provides(DEFAULT_WAREHOUSE_DEPENDENCIES)
class MyWarehouse extends EssWarehouse {
  @inject(IRedoUndoManager)
  redoUndoMgr: StateActionManager;

  async layout(data: any) {
    const point = new basic.Circle([0, 0], { radius: 1000, color: '#097' });
    this.add('point', point);

    await this.imageManager.load(SVG_KUBOT, SVG_KUBOT_RED);

    const bot = this.injector.$new<Bot>(Bot, this.imageManager.get(SVG_KUBOT_RED), 1000, 1000);
    this.add('bot', bot);
  }
}

class LayerCreateAction extends StateActionBase {
  readonly map: HrMap;
  private point: basic.Circle;

  constructor(private warehouse: Warehouse) {
    super();
    this.map = warehouse.map;
  }

  apply(): void {
    if (!this.isRedo) {
      this.point = new basic.Circle(randomLatLng(), { radius: 1000, color: '#097' });
    }

    this.warehouse.add('point', this.point);
  }

  revert(): void {
    this.warehouse.remove('point', this.point);
  }
}

class LayerStateUpdateAction extends StateActionBase {
  apply(): void {
    // this.layer.layerState
  }

  revert(): void {
    // const snapshot = this.layer.getSnapshot();
  }
}

/**
 * @todo add createActionFromLayer()
 */
class LayerPositionAction extends StateActionBase {
  private old: L.LatLng = null;
  private next: L.LatLng = null;

  constructor(private layer: ReactiveLayer, latlng: L.LatLng) {
    super();

    this.old = layer.position;
    this.next = latlng;
  }

  apply(): void {
    this.layer.setPosition(this.next);
  }

  revert(): void {
    this.layer.setPosition(this.old);
  }
}

class BatchedLayerCopyAction extends StateActionBase {
  apply(): void {
    throw new Error('Method not implemented.');
  }
  revert(): void {
    throw new Error('Method not implemented.');
  }
}

export default () => {
  const [warehouse] = useState(() => {
    return rootInjector.$new(MyWarehouse) as MyWarehouse;
  });

  return (
    <Scene.Layout flow="horizontal">
      <Scene modes flex={1} warehouse={warehouse}></Scene>
      {/* <Scene.SelectShell w={300}></Scene.SelectShell> */}
      <div style={{ width: 300 }}>
        <button
          onClick={() => {
            const action = new LayerCreateAction(warehouse);
            warehouse.redoUndoMgr.push(action);
          }}
        >
          create
        </button>
        <button
          onClick={() => {
            // const activeOne = warehouse.selectionManager.getCurrent();
            // if (!activeOne) return;
            const point = warehouse.first('point');
            const action = new LayerPositionAction(point as any, L.latLng(randomLatLng(30000)));
            warehouse.redoUndoMgr.push(action);
          }}
        >
          move
        </button>
        <button
          onClick={() => {
            warehouse.redoUndoMgr.undo();
          }}
        >
          undo
        </button>
        <button
          onClick={() => {
            warehouse.redoUndoMgr.redo();
          }}
        >
          redo
        </button>
      </div>
    </Scene.Layout>
  );
};
