import { LayerWithID } from '../interfaces/WithLayerID';
import { WithEmitter, WithEmitterMix } from '../mixins/Emitter';
import { InteractiveStateActionManager } from './state/InteractiveStateActionManager.class';
import { ObjectType, IWarehouse, GlobalConstManager } from '../model';
import { mixin } from '../model/basic/mixin';
import { Circle, HrMap, LayerList, SVGOverlayList, VectorLayerList } from './basic';
import { Bot } from './Bot.class';
import { CacheShelf } from './CacheShelf.class';
import { Chargepile } from './Chargepile.class';
import { Conveyor } from './Conveyor.class';
import { RenderersManager } from './leafletCanvasOverrides';
import { Haiport } from './Haiport.class';
import { Location } from './Location.class';
import { Point } from './Point.class';
import { Shelf } from './Shelf.class';

import { inject } from '../model/basic/inject';
import * as Interfaces from '../interfaces/symbols';
import * as behaviors from './behaviors';
import { GraphicObject } from '../interfaces/GraghicObject';
import { IBehavior } from '../interfaces/Mode';
import { IInjector } from '../interfaces/Injector';
import { tryInvokingOwn } from '../utils';

import { ModeManager } from '../model/modes/ModeManager.class';
import { AnimationManager } from './animation/AnimationManager.class';
import { ImageManager, PaneManager, SelectionManager, HighlightManager } from './state';

type WarehouseEventType = 'click' | 'dblclick' | 'hover' | 'press' | 'contextmenu' | 'phase';

type ListCtorArgs = {
  pane: string;
  rendererBy?: 'canvas' | 'svg' | 'overlay';
};

@mixin(WithEmitterMix)
export abstract class Warehouse<LayoutData = any, OT extends string = never>
  extends EventEmitter3<WarehouseEventType, any>
  implements IWarehouse
{
  readonly injector: IInjector;

  private updateDeps: Partial<Record<ObjectType<OT>, ItemUpdateFn<LayerWithID, any>>> = {};

  @inject(Interfaces.IAnimationManager)
  readonly animationManager: AnimationManager;
  @inject(Interfaces.IPaneManager)
  readonly paneManager: PaneManager;
  @inject(Interfaces.ISelectionManager)
  readonly selectionManager: SelectionManager;
  @inject(Interfaces.IImageManager)
  readonly imageManager: ImageManager;
  @inject(Interfaces.IHighlightManager)
  readonly highlightManager: HighlightManager;
  @inject(Interfaces.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;
  @inject(Interfaces.IModeManager)
  readonly modeManager: ModeManager;
  @inject(Interfaces.IGlobalConstManager)
  readonly globalConsts: GlobalConstManager;

  private renderersMgr: RenderersManager;

  readonly map: HrMap = null;
  readonly mounted: boolean = false;
  readonly layouted: boolean = false;

  private typeListMapping: Map<ObjectType<OT>, LayerList<LayerWithID>> = new Map();

  points: VectorLayerList<Point>;
  shelfs: VectorLayerList<Shelf>;
  haiports: SVGOverlayList<Haiport>;
  chargepiles: SVGOverlayList<Chargepile>;
  bots: VectorLayerList<Bot>;
  labors: VectorLayerList<Circle>;
  rests: VectorLayerList<Circle>;
  maintains: VectorLayerList<Circle>;

  cacheShelfs: LayerList<CacheShelf>;
  conveyors: LayerList<Conveyor>;
  locations: LayerList<Location>;

  constructor(injector: IInjector) {
    super();

    this.points = injector.$new(VectorLayerList, 'pointPane', 'canvas');
    this.shelfs = injector.$new(VectorLayerList, 'shelfPane', 'canvas');
    this.haiports = injector.$new(SVGOverlayList, 'haiportPane');
    this.chargepiles = injector.$new(SVGOverlayList, 'chargepilePane');
    this.labors = injector.$new(VectorLayerList, 'laborsPane', 'canvas');
    this.rests = injector.$new(VectorLayerList, 'restsPane', 'canvas');
    this.maintains = injector.$new(VectorLayerList, 'maintainsPane', 'canvas');
    this.bots = injector.$new(VectorLayerList, 'botsPane', 'canvas');
    this.cacheShelfs = injector.$new(LayerList);
    this.conveyors = injector.$new(LayerList);
    this.locations = injector.$new(LayerList);

    //#region set
    this.addLayerList('point', this.points);
    this.addLayerList('shelf', this.shelfs);
    this.addLayerList('haiport', this.haiports);
    this.addLayerList('chargepile', this.chargepiles);

    this.addLayerList('labor', this.labors);
    this.addLayerList('rest', this.rests);
    this.addLayerList('maintain', this.maintains);

    this.addLayerList('bot', this.bots);

    this.addLayerList('cacheShelf', this.cacheShelfs);
    this.addLayerList('conveyor', this.conveyors);
    this.addLayerList('location', this.locations);
    //#endregion
  }

  each(fn: (item: GraphicObject, type: ObjectType<OT>) => void, type?: ObjectType<OT>): void {
    for (const [t, list] of this.typeListMapping) {
      if (type && type !== t) continue;
      for (const item of list) {
        fn(item, t);
      }
    }
  }

  first<G>(type: ObjectType<OT>): G {
    const list = this.typeListMapping.get(type);
    for (const item of list) return item as G;
    return null;
  }

  item(type: ObjectType<OT>, id: string) {
    return this.typeListMapping.get(type).find(id);
  }

  query<T extends LayerWithID>(type: ObjectType<OT>, predicate: (item: T) => boolean) {
    return [];
  }

  update(type: ObjectType<OT>, item: LayerWithID, data: any) {
    const updateFn = this.updateDeps[type];

    if (!updateFn && (item as any).onInput) {
      (item as any).onInput(data);
    } else {
      updateFn(item, data);
    }

    const that = this as IWarehouse;
    that.onUpdate && that.onUpdate(item, data);
  }

  add(type: ObjectType<OT>, item: LayerWithID) {
    const list = this.typeListMapping.get(type);
    if (!list) return;
    list.add(item);

    const that = this as IWarehouse;
    that.onAdd && that.onAdd(item);
  }

  remove(type: ObjectType<OT>, item: LayerWithID | string) {
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

  addLayerList(type: ObjectType<OT>, list: LayerList<LayerWithID> | ListCtorArgs) {
    if (!__PROD__ && this.layouted) {
      throw new Error('you can not register new list after layouted! reg in layout method.');
    }

    let _list = null;

    if (!__PROD__ && this.typeListMapping.has(type)) {
      throw new Error(`list type ${type} has been registered!`);
    }

    const injector = this.injector;

    if (list instanceof LayerList) {
      _list = list;
    } else {
      switch (list.rendererBy) {
        case 'canvas':
        case 'svg': {
          _list = injector.$new(VectorLayerList, list.pane, list.rendererBy);
          break;
        }
        case 'overlay': {
          _list = injector.$new(SVGOverlayList, list.pane);
          break;
        }
        default: {
          _list = injector.$new(LayerList, []);
          break;
        }
      }
    }

    this.typeListMapping.set(type, _list);
    this.setEventChild(_list);

    this.mounted && this.onListMount(_list);

    return _list;
  }

  private onListMount(list: LayerList<LayerWithID>) {
    list.mount(this.map);
    if (list instanceof VectorLayerList) {
      this.renderersMgr.add(list.pane, list.paneObj.renderer);
    }
  }

  mount(map: HrMap) {
    if (this.mounted) return;

    this.emit('phase', { phase: WarehousePhase.mount });

    const injector = this.injector;

    // inject
    injector.writeProp(this, 'map', map);
    injector.writeProp(this.paneManager, 'map', map);

    this.renderersMgr = new RenderersManager(this.paneManager, map);

    // mount list
    for (const [_, list] of this.typeListMapping) {
      if (list.mounted) continue;
      this.onListMount(list);
    }

    //#region modes
    this.modeManager.create('default', injector.$new(behaviors.DefaultBehavior));

    const modes = this.configModes();
    for (const m in modes) {
      this.modeManager.create(m, ...modes[m]);
    }

    this.modeManager.mode = 'default';

    // dev html
    if (!__PROD__) {
      const div = document.createElement('div');
      div.style.cssText = 'position: absolute; z-index: 9999; top: 0; left: 0; width: 1080px;';

      for (const [_, mode] of this.modeManager.modes) {
        const btn = document.createElement('button');
        btn.style.cssText = 'border: 1px solid #000; margin: 0 1px';
        btn.onclick = () => {
          this.modeManager.mode = mode;
        };
        div.appendChild(btn);
        btn.innerHTML = mode.name;
      }

      this.map._container.appendChild(div);
    }

    //#endregion

    //#region events & mode apply
    {
      this.on('click', (e) => {
        const { layer, leafletEvt } = e.payload;
        tryInvokingOwn(this, 'onClick', layer, leafletEvt);
        this.modeManager.apply('onClick', layer, e);
      });

      this.on('dblclick', (e) => {
        const { layer, leafletEvt } = e.payload;
        tryInvokingOwn(this, 'onDblClick', layer, leafletEvt);
        this.modeManager.apply('onDblClick', layer, e);
      });

      this.on('hover', (e) => {
        const { layer, on, leafletEvt } = e.payload;
        tryInvokingOwn(this, 'onHover', layer, on, leafletEvt);
        this.modeManager.apply('onHover', layer, on, leafletEvt);
      });

      this.on('press', (e) => {
        const { layer, leafletEvt } = e.payload;
        tryInvokingOwn(this, 'onPress', layer, leafletEvt);
        this.modeManager.apply('onPress', layer, leafletEvt);
      });

      this.on('contextmenu', (e) => {
        const { layer, leafletEvt } = e.payload;
        tryInvokingOwn(this, 'onContextMenu', layer, leafletEvt);
        this.modeManager.apply('onContextMenu', layer, leafletEvt);
      });

      /**
       * event bind on map seems like that it can't read the actual propagatedFrom layer, no this field.
       */
      this.map
        .on('mousedown mousemove mouseup click', (evt) => {
          if (evt.type === 'click' && this.map.isObjClickEventCancelled) return;
          this.modeManager.apply(eventName_behaviorCallback_mapping[evt.type], evt);
        })
        .on('zoom drag', () => {
          this.animationManager.flush();
        });
    }

    //#endregion

    injector.writeProp(this, 'mounted', true);
    tryInvokingOwn(this, 'onMounted');
    this.emit('phase', { phase: WarehousePhase.mounted });

    //#region layout

    (async () => {
      this.emit('phase', { phase: WarehousePhase.data });
      console.time('phase:data');
      const d = await this.getLayoutData();
      console.timeEnd('phase:data');
      this.emit('phase', { phase: WarehousePhase.layout });
      console.time('phase:layout');
      await this.layout(d);
      console.timeEnd('phase:layout');

      this.renderersMgr.interactAll();

      injector.writeProp(this, 'layouted', true);
      tryInvokingOwn(this, 'onLayouted');
      this.emit('phase', { phase: WarehousePhase.ready });
    })();

    //#endregion
  }

  addUpdateDep<M extends LayerWithID = LayerWithID, D = any>(
    type: ObjectType,
    fn: ItemUpdateFn<M, D> = null,
  ) {
    this.updateDeps[type] = fn as any;
  }

  /**
   * retains the data for layouting ,which is the initial data. default is null, you can't overrides it in subclass.
   */
  getLayoutData(): Promise<LayoutData> {
    return Promise.resolve(null);
  }

  /**
   * default is empty, you can overrides it.
   */
  configModes(): Record<string, IBehavior[]> {
    return {};
  }

  abstract layout(data?: LayoutData): void | Promise<void>;
}

export interface Warehouse<LayoutData> extends WithEmitter<WarehouseEventType> {}

export type ItemUpdateFn<M extends LayerWithID, D> = (item: M, data: D) => void;

export enum WarehousePhase {
  mount = 1,
  mounted = 5,
  data = 10,
  layout = 20,
  ready = 40,
}

const eventName_behaviorCallback_mapping = {
  dragstart: 'onDragStart',
  drag: 'onDrag',
  dragend: 'onDragEnd',
  mousedown: 'onMouseDown',
  mousemove: 'onMouseMove',
  mouseup: 'onMouseUp',
  click: 'onNoopClick',
};
