import L from 'leaflet';
import {
  IWarehouse,
  Core,
  inject,
  const$$,
  interfaces,
  GlobalConstManager,
  ModeManager,
  SelectionManager,
  HighlightManager,
  InteractiveStateActionManager,
  WikEvent,
  ListCtorArgs,
  IWarehouseOptional,
  util$$,
} from '@/model';

import * as behaviors from '../behaviors';

import {
  GraphicObject,
  LayerWithID,
  ILogger,
  IBehavior,
  IInjector,
  Constructor,
} from '@/interfaces';

import { tryInvokingOwn } from '@/utils';

import { AnimationManager } from '../animation/AnimationManager.class';
import { ImageManager } from '../state';
import { PaneManager } from '../state/PaneManager.class';
import { WikMap } from './Map.class';
import { LayerList } from './LayerList.class';
import { SVGOverlayList } from './SVGOverlayList.class';
import { VectorLayerList } from './VectorLayerList.class';
import { WarehousePhase } from './WarehousePhase';
import { MarkerList } from './MarkerList.class';
import { GroupList } from './GroupList.class';

type WarehouseEventType = 'click' | 'dblclick' | 'hover' | 'press' | 'contextmenu' | 'phase';

export abstract class Warehouse<LayoutData = any, OT extends string = string>
  extends Core<WarehouseEventType>
  implements IWarehouse
{
  readonly injector: IInjector;

  private updateDeps: Partial<Record<OT, ItemUpdateFn<LayerWithID, any>>> = {};

  @inject(interfaces.IAnimationManager)
  readonly animationManager: AnimationManager;
  @inject(interfaces.IPaneManager)
  readonly paneManager: PaneManager;
  @inject(interfaces.ISelectionManager)
  readonly selectionManager: SelectionManager;
  @inject(interfaces.IImageManager)
  readonly imageManager: ImageManager;
  @inject(interfaces.IHighlightManager)
  readonly highlightManager: HighlightManager;
  @inject(interfaces.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;
  @inject(interfaces.IModeManager)
  readonly modeManager: ModeManager;
  @inject(interfaces.IGlobalConstManager)
  readonly globalConsts: GlobalConstManager;
  @inject(interfaces.ILogger)
  readonly logger: ILogger;

  readonly scene: WikMap = null;
  readonly mounted: boolean = false;
  readonly layouted: boolean = false;

  private typedLists: Map<OT, LayerList<LayerWithID>> = new Map();

  *[Symbol.iterator]() {
    for (const [_, list] of this.typedLists) {
      for (const item of list) {
        yield item;
      }
    }
  }

  queryListAll() {
    const entries = [];
    for (const [type, value] of this.typedLists) {
      entries.push({ type, value });
    }
    return entries;
  }

  queryList(type: OT) {
    return this.typedLists.get(type);
  }

  each(fn: (item: GraphicObject, type: OT) => void, type?: OT): void {
    for (const [t, list] of this.typedLists) {
      if (type && type !== t) continue;
      for (const item of list) {
        fn(item, t);
      }
    }
  }

  first<G>(type: OT): G {
    const list = this.typedLists.get(type);
    for (const item of list) return item as G;
    return null;
  }

  item(type: OT, id: string) {
    return this.typedLists.get(type).find(id);
  }

  query<T extends LayerWithID>(type: OT, predicate: (item: T) => boolean) {
    return [];
  }

  update(type: OT, item: LayerWithID, data: any) {
    const updateFn = this.updateDeps[type];

    if (!updateFn && item.onInput) {
      item.onInput(data);
    } else {
      updateFn(item, data);
    }

    this.onUpdate && this.onUpdate(item, data);
  }

  add(type: OT, item: LayerWithID) {
    const list = this.typedLists.get(type);
    if (!list) {
      if (!__PROD__) {
        console.log('[Warehouse.add]', 'no list for type', type);
      }
      return null;
    }

    list.add(item);

    this.onAdd && this.onAdd(item);

    return item;
  }

  remove(type: OT, item: LayerWithID | string) {
    const list = this.typedLists.get(type);
    if (!list) return;
    let _item: LayerWithID = null;
    if (typeof item === 'string') {
      _item = list.find(item);
    } else {
      _item = item;
    }

    list.remove(_item);

    this.onRemove && this.onRemove(_item);
  }

  regList(type: OT, list: LayerList<LayerWithID> | ListCtorArgs) {
    if (!__PROD__ && this.layouted) {
      throw new Error('you can not register new list after layouted! reg in layout method.');
    }

    let _list = null;

    if (!__PROD__ && this.typedLists.has(type)) {
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
        case 'marker': {
          _list = injector.$new(MarkerList, list.pane);
          break;
        }
        case 'group': {
          _list = injector.$new(GroupList, [], { pane: list.pane });
          break;
        }
        default: {
          _list = injector.$new(LayerList, []);
          break;
        }
      }
    }

    this.typedLists.set(type, _list);
    this.setEventChild(_list);

    this.mounted && _list.mount(this.scene);

    return _list;
  }

  unregList(type: OT) {
    const list = this.typedLists.get(type);
    if (!list) return;

    this.typedLists.delete(type);

    list.setEventParent(null);

    list.mounted && list.unmount();
  }

  mount(map: WikMap) {
    if (this.mounted) return;

    this.fire('phase', { phase: WarehousePhase.mount });

    const injector = this.injector;

    // inject
    this.readOnly('scene', map);
    util$$.writeProp(this.paneManager, 'scene', map);

    this.paneManager.interact();

    // mount list
    for (const [_, list] of this.typedLists) {
      if (list.mounted) continue;
      list.mount(this.scene);
    }

    // axes
    {
      // X
      L.polyline(
        [
          [0, 0],
          [0, 10000],
        ],
        { weight: 1, color: '#3487f0', dashArray: [3, 4] },
      ).addTo(map);

      // Y
      L.polyline(
        [
          [0, 0],
          [10000, 0],
        ],
        { weight: 1, color: '#ff4f00', dashArray: [3, 4] },
      ).addTo(map);
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
      injector.$new(behaviors.RectangleSelectBehavior, this, map),
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
      // this.listen$n('click dblclick mouseover mouseout mousedown contextmenu', (evt: WikEvent) => {
      //   if (evt.type === 'click' && this.scene.isClickEventFireCancelled) return;
      //   const { layer, leafletEvt } = evt.payload;
      //   const cb = const$$.event2behavior[`item@${evt.type}`];
      //   tryInvokingOwn(this, cb, layer, leafletEvt);
      //   this.modeManager.apply(cb, layer, leafletEvt);
      // });

      /**
       * event bind on map seems like that it can't read the actual propagatedFrom layer, no this field.
       */
      this.scene
        .on('mousedown mousemove mouseup click', (evt) => {
          if (evt.type === 'click' && this.scene.isClickEventFireCancelled) return;
          this.modeManager.apply(const$$.event2behavior[evt.type], evt);
        })
        .on('zoom drag', () => {
          this.animationManager.flush();
        });
    }

    //#endregion

    injector.writeProp(this, 'mounted', true);
    tryInvokingOwn(this, 'onMounted');
    this.fire('phase', { phase: WarehousePhase.mounted });

    //#region layout

    (async () => {
      this.fire('phase', { phase: WarehousePhase.data });
      let time = performance.now();
      const d = await this.getLayoutData();
      console.log('getLayoutData takes:', performance.now() - time);
      this.fire('phase', { phase: WarehousePhase.layout });
      time = performance.now();
      await this.layout(d);
      console.log('layout takes:', performance.now() - time);

      injector.writeProp(this, 'layouted', true);
      tryInvokingOwn(this, 'onLayouted');
      this.fire('phase', { phase: WarehousePhase.ready });
    })();

    //#endregion
  }

  unmount() {}

  addUpdateDep<M extends LayerWithID = LayerWithID, D = any>(
    type: OT,
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

  create<C extends Constructor>(ctor: C, ...args: ConstructorParameters<C>) {
    return this.injector.$new(ctor, ...args) as InstanceType<C>;
  }

  abstract layout(data?: LayoutData): void | Promise<void>;
}

export type ItemUpdateFn<M extends LayerWithID, D> = (item: M, data: D) => void;

export interface Warehouse<LayoutData = any, OT extends string = string>
  extends IWarehouseOptional {}
