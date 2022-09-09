import L from 'leaflet';
import { Interactive } from '../interfaces/Interactive';
import { LayerWithID } from '../interfaces/WithLayerID';
import { WithEmitter, WithEmitterMix } from '../mixins/Emitter';
import { InteractiveStateActionManager } from '../mixins/InteractiveStateActionManager.class';
import { ObjectType, IWarehouse } from '../model';
import { HrEvent } from '../model/basic/Event.class';
import { mixin } from '../model/basic/mixin';
import {
  HrMap,
  ImageManager,
  LayerList,
  PaneManager,
  SelectionManager,
  SVGOverlayList,
  VectorLayerList,
} from './basic';
import { AnimationManager } from './animation/AnimationManager.class';
import { HighlightManager } from './basic/HighlightManager.class';
import { Bot } from './Bot.class';
import { CacheShelf } from './CacheShelf.class';
import { Chargepile } from './Chargepile.class';
import { Conveyor } from './Conveyor.class';
import { manageRenderer } from './danger';
import { Haiport } from './Haiport.class';
import { Location } from './Location.class';
import { Point } from './Point.class';
import { Shelf } from './Shelf.class';

import { inject, injector } from '../model/basic/inject';
import * as Interface from '../interfaces/symbols';
import { ModeManager } from '../model/modes/ModeManager.class';
import * as behaviors from './behaviors';
import { GraphicObject } from '../interfaces/GraghicObject';

type WarehouseEventType = 'click' | 'dblclick' | 'hover' | 'press' | 'contextmenu' | 'noopclick';

@mixin(WithEmitterMix)
export abstract class Warehouse<LayoutData = any>
  extends EventEmitter3<WarehouseEventType, any>
  implements IWarehouse
{
  private updateDeps: Partial<Record<ObjectType, ItemUpdateFn<LayerWithID, any>>> = {};

  @inject(Interface.IAnimationManager)
  readonly animationManager: AnimationManager;
  @inject(Interface.IPaneManager)
  readonly paneManager: PaneManager;
  @inject(Interface.ISelectionManager)
  readonly selectionManager: SelectionManager;
  @inject(Interface.IImageManager)
  readonly imageManager: ImageManager;
  @inject(Interface.IHighlightManager)
  readonly highlightManager: HighlightManager;
  @inject(Interface.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;
  @inject(Interface.IModeManager)
  readonly modeManager: ModeManager;

  readonly map: HrMap = null;
  readonly mounted: boolean = false;

  private typeListMapping: Map<ObjectType, LayerList<LayerWithID>> = new Map();

  points: VectorLayerList<Point>;
  shelfs: VectorLayerList<Shelf>;
  haiports: SVGOverlayList<Haiport>;
  chargepiles: SVGOverlayList<Chargepile>;
  bots: VectorLayerList<Bot>;

  cacheShelfs: LayerList<CacheShelf>;
  conveyors: LayerList<Conveyor>;
  locations: LayerList<Location>;

  public injector = injector;

  constructor() {
    super();

    this.points = injector.$new(VectorLayerList, 'pointPane', 'canvas');
    this.shelfs = injector.$new(VectorLayerList, 'shelfPane', 'canvas');
    this.haiports = injector.$new(SVGOverlayList, 'haiportPane');
    this.chargepiles = injector.$new(SVGOverlayList, 'chargepilePane');
    this.bots = injector.$new(VectorLayerList, 'botsPane', 'canvas');
    this.cacheShelfs = injector.$new(LayerList);
    this.conveyors = injector.$new(LayerList);
    this.locations = injector.$new(LayerList);

    //#region set
    this.regTypeList(ObjectType.point, this.points);
    this.regTypeList(ObjectType.shelf, this.shelfs);
    this.regTypeList(ObjectType.haiport, this.haiports);
    this.regTypeList(ObjectType.chargepile, this.chargepiles);
    this.regTypeList(ObjectType.bot, this.bots);
    this.regTypeList(ObjectType.cacheShelf, this.cacheShelfs);
    this.regTypeList(ObjectType.conveyor, this.conveyors);
    this.regTypeList(ObjectType.location, this.locations);
    //#endregion
  }

  each(fn: (item: GraphicObject, type: ObjectType) => void, type?: ObjectType): void {
    for (const [t, list] of this.typeListMapping) {
      if (type && type !== t) continue;
      for (const item of list) {
        fn(item, t);
      }
    }
  }

  first<G>(type: ObjectType): G {
    const list = this.typeListMapping.get(type);
    for (const item of list) return item as G;
    return null;
  }

  item(type: ObjectType, id: string) {
    return this.typeListMapping.get(type).find(id);
  }

  query<T extends LayerWithID>(type: ObjectType, predicate: (item: T) => boolean) {
    return [];
  }

  update(type: ObjectType, item: LayerWithID, data: any) {
    const updateFn = this.updateDeps[type];

    if (!updateFn && (item as any).onInput) {
      (item as any).onInput(data);
    } else {
      updateFn(item, data);
    }

    const that = this as IWarehouse;
    that.onUpdate && that.onUpdate(item, data);
  }

  add(type: ObjectType, item: LayerWithID) {
    const list = this.typeListMapping.get(type);
    if (!list) return;
    list.add(item);

    const that = this as IWarehouse;
    that.onAdd && that.onAdd(item);
  }

  remove(type: ObjectType, item: LayerWithID | string) {
    const list = this.typeListMapping.get(type);
    if (!list) return;
    let _item: LayerWithID = null;
    if (typeof item === 'string') {
      _item = list.find(item);
    } else {
      _item = item;
    }

    list.remove(_item);

    const that = this as IWarehouse;
    that.onRemove && that.onRemove(_item);
  }

  regTypeList(type: number, list: LayerList<LayerWithID>) {
    if (!this.typeListMapping.has(type)) {
      this.typeListMapping.set(type, list);
    }

    this.setEventChild(list);

    this.mounted && this.onListMount(list);
  }

  private onListMount(list: LayerList<LayerWithID>) {
    list.mount(this.map);
    if (list instanceof VectorLayerList) {
      console.log(list.paneObj.name);
      manageRenderer(list.pane, list.paneObj.renderer);
    }
  }

  mount(map: HrMap) {
    injector.writeProp(this, 'map', map);
    injector.writeProp(this.paneManager, 'map', map);
    injector.writeProp(this, 'mounted', true);

    for (const [_, list] of this.typeListMapping) {
      this.onListMount(list);
    }

    //#region modes
    this.modeManager.create('default', injector.$new(behaviors.DefaultBehavior));
    this.modeManager.create('readonly', new behaviors.ReadonlyBehavior());
    this.modeManager.create(
      'draw',
      new behaviors.DrawBehavior(map),
      new behaviors.WaterDropBehavior(map),
    );
    this.modeManager.create('select', injector.$new(behaviors.RectDrawBehavior, this, map));
    this.modeManager.create('particles', injector.$new(behaviors.FireworksBehavior, map));
    this.modeManager.create('gravity', new behaviors.GravityBehavior(map));
    this.modeManager.create('bezier', new behaviors.BezierBehavior(map, this));
    this.modeManager.create('editable', new behaviors.EditBehavior(this, map));

    this.modeManager.mode = 'bezier';

    if (!__PROD__) {
      const div = document.createElement('div');
      div.style.cssText = 'position: fixed; z-index: 9999; top: 0; left: 0; width: 500px;';

      for (const [_, mode] of this.modeManager.modes) {
        const btn = document.createElement('button');
        btn.style.cssText = 'border: 1px solid #000; margin: 0 1px';
        btn.onclick = () => {
          this.modeManager.mode = mode;
        };
        div.appendChild(btn);
        btn.innerHTML = mode.name;
      }

      document.body.appendChild(div);
    }

    //#endregion

    //#region events

    const invokeCallbackOnSub = (e: HrEvent, onCall: string, ...args: any[]) => {
      const layer = e.payload.layer as Interactive;
      if (Object.hasOwn(this, onCall)) {
        this[onCall](layer, ...args);
      }
      return layer;
    };

    this.on('click', (e) => {
      const layer = invokeCallbackOnSub(e, 'onClick');
      this.modeManager.apply('onClick', layer, e);
    });

    this.on('dblclick', (e) => {
      const layer = invokeCallbackOnSub(e, 'onDblClick');
      this.modeManager.apply('onDblClick', layer, e);
    });

    this.on('hover', (e) => {
      const { layer, on, leafletEvt } = e.payload;
      invokeCallbackOnSub(e, 'onHover', on, leafletEvt);
      this.modeManager.apply('onHover', layer, on, leafletEvt);
    });

    this.on('press', (e) => {
      const { layer, leafletEvt } = e.payload;
      invokeCallbackOnSub(e, 'onPress', layer, leafletEvt);
      this.modeManager.apply('onPress', layer, leafletEvt);
    });

    this.on('contextmenu', (e) => {
      const { layer, leafletEvt } = e.payload;
      invokeCallbackOnSub(e, 'onContextMenu', layer, leafletEvt);
      this.modeManager.apply('onContextMenu', layer, leafletEvt);
    });

    /**
     * event bind on map seems like that it can't read the actual propagatedFrom layer, no this field.
     */
    this.map.on('mousedown mousemove mouseup click', (evt) => {
      if (evt.type === 'click' && this.map.isObjClickEventCancelled) return;
      this.modeManager.apply(eventNameCallbackMap[evt.type], evt);
    });
    //#endregion
  }

  addUpdateDep<M extends LayerWithID = LayerWithID, D = any>(
    type: ObjectType,
    fn: ItemUpdateFn<M, D> = null,
  ) {
    this.updateDeps[type] = fn as any;
  }

  abstract layout(data: LayoutData): void;
}

export interface Warehouse<LayoutData> extends WithEmitter<WarehouseEventType> {}

export type ItemUpdateFn<M extends LayerWithID, D> = (item: M, data: D) => void;

const eventNameCallbackMap = {
  dragstart: 'onDragStart',
  drag: 'onDrag',
  dragend: 'onDragEnd',
  mousedown: 'onMouseDown',
  mousemove: 'onMouseMove',
  mouseup: 'onMouseUp',
  click: 'onNoopClick',
};
