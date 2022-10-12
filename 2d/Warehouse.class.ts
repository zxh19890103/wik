import { LayerWithID } from '../interfaces/WithLayerID';
import { WithEmitter, EmitterMix, __emit__, __on__ } from '../mixins/Emitter';
import { InteractiveStateActionManager } from './state/InteractiveStateActionManager.class';
import { ObjectType, IWarehouse, ListCtorArgs } from '../model';
import { ModeManager } from '../model/modes';
import { ConfigProviderConfigValue, mixin } from '../model/basic';
import { GlobalConstManager } from '../model/state';
import { Circle, HrMap, LayerList, SVGOverlayList, VectorLayerList } from './basic';
import { Bot } from './Bot.class';
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

import { AnimationManager } from './animation/AnimationManager.class';
import { ImageManager, PaneManager, SelectionManager, HighlightManager } from './state';
import { ILogger } from '../interfaces/Logger';
import { HrEvent } from '../model/basic/Event.class';

type WarehouseEventType = 'click' | 'dblclick' | 'hover' | 'press' | 'contextmenu' | 'phase';

@mixin(EmitterMix)
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
  @inject(Interfaces.ILogger)
  readonly logger: ILogger;

  @inject(Interfaces.IRendererManager)
  readonly renderersMgr: RenderersManager;

  readonly map: HrMap = null;
  readonly mounted: boolean = false;
  readonly layouted: boolean = false;

  private typeListMapping: Map<ObjectType<OT>, LayerList<LayerWithID>> = new Map();

  readonly points: VectorLayerList<Point>;
  readonly shelfs: VectorLayerList<Shelf>;
  readonly haiports: SVGOverlayList<Haiport>;
  readonly chargepiles: SVGOverlayList<Chargepile>;
  readonly bots: VectorLayerList<Bot>;
  readonly labors: VectorLayerList<Circle>;
  readonly rests: VectorLayerList<Circle>;
  readonly maintains: VectorLayerList<Circle>;

  readonly locations: LayerList<Location>;
  readonly conveyors: VectorLayerList<Conveyor>;

  constructor(injector: IInjector) {
    super();

    this.points = injector.$new<any>(VectorLayerList, 'pointPane', 'canvas');
    this.shelfs = injector.$new<any>(VectorLayerList, 'shelfPane', 'canvas');
    this.haiports = injector.$new<any>(SVGOverlayList, 'haiportPane');
    this.chargepiles = injector.$new<any>(SVGOverlayList, 'chargepilePane');
    this.labors = injector.$new<any>(VectorLayerList, 'laborsPane', 'canvas');
    this.rests = injector.$new<any>(VectorLayerList, 'restsPane', 'canvas');
    this.maintains = injector.$new<any>(VectorLayerList, 'maintainsPane', 'canvas');
    this.bots = injector.$new<any>(VectorLayerList, 'botsPane', 'canvas');
    // this.cacheShelfs = injector.$new<any>(LayerList);
    this.conveyors = injector.$new<any>(VectorLayerList, 'conveyorPane', 'canvas');
    ///
    this.locations = injector.$new<any>(LayerList);

    //#region set
    this.addList('point', this.points);
    this.addList('shelf', this.shelfs);
    this.addList('haiport', this.haiports);
    this.addList('chargepile', this.chargepiles);

    this.addList('labor', this.labors);
    this.addList('rest', this.rests);
    this.addList('maintain', this.maintains);

    this.addList('bot', this.bots);

    // this.addList('cacheShelf', this.cacheShelfs);
    this.addList('conveyor', this.conveyors);
    this.addList('location', this.locations);
    //#endregion
  }

  *[Symbol.iterator]() {
    for (const [_, list] of this.typeListMapping) {
      for (const item of list) {
        yield item;
      }
    }
  }

  queryListAll() {
    const entries = [];
    for (const [type, value] of this.typeListMapping) {
      entries.push({ type, value });
    }
    return entries;
  }

  queryList(type: string) {
    return this.typeListMapping.get(type as ObjectType<OT>);
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

  addList(type: ObjectType<OT>, list: LayerList<LayerWithID> | ListCtorArgs) {
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

    this.mounted && _list.mount(this.map);

    return _list;
  }

  removeList(type: ObjectType<OT>) {
    throw new Error('not implemented!');
  }

  mount(map: HrMap) {
    if (this.mounted) return;

    this.emit('phase', { phase: WarehousePhase.mount });

    const injector = this.injector;

    // inject
    injector.writeProp(this, 'map', map);
    injector.writeProp(this.paneManager, 'map', map);
    injector.writeProp(this.renderersMgr, 'map', map);

    // mount list
    for (const [_, list] of this.typeListMapping) {
      if (list.mounted) continue;
      list.mount(this.map);
    }

    //#region modes
    this.modeManager.create(
      'readonly',
      injector.$new(behaviors.ReadonlyBehavior),
      injector.$new(behaviors.DragBehavior, map),
    );

    this.modeManager.create(
      'default',
      injector.$new(behaviors.DefaultBehavior),
      injector.$new(behaviors.DragBehavior, map),
    );

    this.modeManager.create(
      'edit',
      injector.$new(behaviors.DefaultBehavior),
      injector.$new(behaviors.SpaceDragBehavior, map),
      injector.$new(behaviors.RectDrawSelectBehavior, this, map),
      injector.$new(behaviors.EditBehavior, this, map),
    );

    const modes = this.configModes();
    for (const m in modes) {
      this.modeManager.create(m, ...modes[m]);
    }

    this.modeManager.mode = 'readonly';

    //#endregion

    //#region events & mode apply
    {
      /**
       * mapping from event of emitter or lealfet to behavior's callbacks.
       */
      const event2cb = {
        'item@click': 'onClick',
        'item@dblclick': 'onDblClick',
        'item@hover': 'onHover',
        'item@unhover': 'onUnHover',
        'item@press': 'onPress',
        'item@contextmenu': 'onContextMenu',
        mousedown: 'onMouseDown',
        mousemove: 'onMouseMove',
        mouseup: 'onMouseUp',
        click: 'onNoopClick',
      };

      __on__(this, 'click dblclick hover unhover press contextmenu', (evt: HrEvent) => {
        if (evt.type === 'click' && this.map.isObjClickEventCancelled) return;
        const { layer, leafletEvt } = evt.payload;
        const cb = event2cb[`item@${evt.type}`];
        tryInvokingOwn(this, cb, layer, leafletEvt);
        this.modeManager.apply(cb, layer, leafletEvt);
      });

      /**
       * event bind on map seems like that it can't read the actual propagatedFrom layer, no this field.
       */
      this.map
        .on('mousedown mousemove mouseup click', (evt) => {
          if (evt.type === 'click' && this.map.isObjClickEventCancelled) return;
          this.modeManager.apply(event2cb[evt.type], evt);
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
      let time = performance.now();
      const d = await this.getLayoutData();
      console.log('getLayoutData takes:', performance.now() - time);
      this.emit('phase', { phase: WarehousePhase.layout });
      time = performance.now();
      await this.layout(d);
      console.log('layout takes:', performance.now() - time);

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
   * retains the data for layouting ,which is the initial data. default is null, you can overrides it in subclass.
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

export const DEFAULT_WAREHOUSE_DEPENDENCIES: Record<symbol, ConfigProviderConfigValue> = {
  [Interfaces.IPaneManager]: PaneManager,
  [Interfaces.IModeManager]: ModeManager,
  [Interfaces.IAnimationManager]: AnimationManager,
  [Interfaces.IHighlightManager]: HighlightManager,
  [Interfaces.IRendererManager]: RenderersManager,
};
