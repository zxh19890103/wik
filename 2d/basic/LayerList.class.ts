import L from 'leaflet';
import { EventEmitter } from 'eventemitter3';
import { IList, List } from '../../model/basic/List.class';
import { HrMap } from './Map.class';
import { IDisposable } from '../../interfaces/Disposable';
import { mixin } from '../../model/basic/mixin';
import { WithEmitter, EmitterMix } from '../../mixins/Emitter';
import { LayerWithID } from '../../interfaces/WithLayerID';
import { InteractiveStateActionManager } from '../state/InteractiveStateActionManager.class';
import { inject } from '../../model/basic/inject';
import { WithClickCancel } from '../../mixins/ClickCancel';
import { IInjector, WithInjector } from '../../interfaces/Injector';
import { IWarehouse } from '../../model';
import Interface from '../../interfaces/symbols';

type LayerListEventType =
  | 'add'
  | 'add.r'
  | 'remove'
  | 'remove.r'
  | 'clear'
  | 'update'
  | 'update.r'
  | 'click'
  | 'dblclick'
  | 'mouseover'
  | 'mouseout'
  | 'mousedown'
  | 'contextmenu';

@mixin(EmitterMix)
export class LayerList<M extends LayerWithID, E extends string = never>
  extends EventEmitter<E | LayerListEventType, any>
  implements IList<M>, IDisposable, WithInjector
{
  $$parent: IWarehouse;
  injector: IInjector;

  items: Set<M> = new Set();
  index: Map<string, M> = new Map();
  size = 0;

  @inject(Interface.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;
  readonly mounted = false;

  protected featureGroup: L.FeatureGroup = null;
  protected isBatching = false;
  /**
   * map is conflict with the function map.
   */
  protected _map: HrMap = null;

  constructor(layers?: M[]) {
    super();
    this.featureGroup = new L.FeatureGroup([], {});

    this.featureGroup.on(
      'click dblclick mousedown mouseover mouseout contextmenu',
      (evt) => {
        L.DomEvent.stop(evt);

        const layer = evt.propagatedFrom as WithClickCancel;

        if (evt.type === 'click' && layer.isObjClickEventCancelled) return;

        this.fire(evt.type as LayerListEventType, {
          layer,
          leafletEvt: evt,
        });
      },
      this,
    );

    layers && this.addArr(layers);
  }

  *[Symbol.iterator]() {
    for (const item of this.items) {
      yield item;
    }
  }

  map<R>(project: (item: M) => R): R[] {
    return List.prototype.map.call(this, project) as R[];
  }

  add(item: M): void {
    this.onItemAdd && this.onItemAdd(item);

    this.items.add(item);
    this.index.set(item.layerId, item);
    this.featureGroup.addLayer(item as unknown as L.Layer);

    this.size += 1;

    if (this.isBatching) return;

    this.fire('add', { item });
  }

  addRange(...items: M[]): void {
    this.addArr(items);
  }

  /**
   * for big number of items, spread operation doesn't work.
   */
  addArr(items: M[]): void {
    this.isBatching = true;

    for (const item of items) {
      this.add(item);
    }

    this.isBatching = false;

    this.fire('add.r', { items });
  }

  remove(item?: M) {
    if (!item) {
      this.clear();
      return;
    }

    if (!this.items.has(item)) {
      return;
    }

    this.items.delete(item);
    this.index.delete(item.layerId);
    this.featureGroup.removeLayer(item as unknown as L.Layer);

    this.size -= 1;

    if (this.isBatching) return;

    this.fire('remove', { item });
  }

  removeRange(...items: M[]): void {
    this.removeArr(items);
  }

  removeArr(items: M[]): void {
    this.isBatching = true;

    for (const item of items) {
      this.remove(item);
    }

    this.isBatching = false;

    this.fire('remove.r', { items });
  }

  removeById(id: string): void {
    const item = this.index.get(id);
    if (item) {
      this.remove(item);
      return;
    }

    // fallback
    for (const item of this.items) {
      if (item.layerId === id) {
        this.remove(item);
        break;
      }
    }
  }

  clear(): void {
    this.items.clear();
    this.index.clear();
    this.featureGroup.clearLayers();
    this.size = 0;

    this.fire('clear', null);
  }

  update(item: M): void {
    throw new Error('Method not implemented.');
  }

  updateRange(...items: M[]): void {
    throw new Error('Method not implemented.');
  }

  has(id: string | M): boolean {
    if (typeof id === 'string') {
      const item = this.index.get(id);
      if (!item) return false;
      return this.items.has(item);
    }

    return this.items.has(id);
  }

  find(id: string): M {
    const item = this.index.get(id);
    if (item) return item;
    // fallback
    for (const item of this.items) {
      if (item.layerId === id) {
        return item;
      }
    }
    return null;
  }

  query(predicate: (item: M) => boolean): M[] {
    const items = [];
    for (const item of this.items) {
      if (predicate(item)) {
        items.push(item);
      }
    }
    return items;
  }

  filter(pipe: (m: M) => boolean): M[] {
    return List.prototype.filter.call(this, pipe);
  }

  create(...args: any[]): M {
    throw new Error('Method not implemented.');
  }

  mount(parent: HrMap) {
    this._map = parent;
    parent.addLayer(this.featureGroup);
    this.injector.writeProp(this, 'mounted', true);
  }

  fit(immediately = false) {
    const b = this.featureGroup.getBounds();
    if (!b.isValid()) return;
    if (immediately) {
      this._map.fitBounds(b, { animate: true });
    } else {
      setTimeout(() => {
        this._map.fitBounds(b, { animate: true });
      }, 10);
    }
  }

  setZ(z: number) {}

  dispose(): void {
    this._map = null;
  }
}

export interface LayerList<M extends LayerWithID, E extends string = never>
  extends WithEmitter<E | LayerListEventType> {
  onItemAdd?(item: M): void;
}
