import L, { LeafletEvent, LeafletMouseEvent } from 'leaflet';
import { WikMap } from './Map.class';
import { IDisposable, LayerWithID, IInjector, WithInjector } from '@/interfaces';
import {
  inject,
  IWarehouseObjectList,
  InteractiveStateActionManager,
  CoreList,
  IWarehouse,
  interfaces,
  WithClickCancel,
  util$$,
  ModeManager,
  const$$,
} from '@/model';
import { tryInvokingOwn } from '@/utils';
import { ReactiveLayer } from '@/mixins';
import { Group } from './Group.class';

type LayerListEventType =
  | 'click'
  | 'dblclick'
  | 'mouseover'
  | 'mouseout'
  | 'mousedown'
  | 'contextmenu';

export class LayerList<M extends LayerWithID, E extends string = never>
  extends CoreList<M, LayerListEventType | E>
  implements IDisposable, WithInjector, IWarehouseObjectList
{
  $$parent: IWarehouse;
  injector: IInjector;

  readonly itemKey: string = 'layerId';

  @inject(interfaces.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;
  @inject(interfaces.IModeManager)
  readonly modeMgr: ModeManager;

  readonly mounted = false;

  protected featureGroup: L.FeatureGroup = null;
  readonly scene: WikMap = null;

  constructor(layers?: M[]) {
    super();
    this.featureGroup = new L.FeatureGroup([], {});

    /**
     * stop the leaflet events and transform to emiter
     */
    this.featureGroup
      .on(
        'click dblclick mousedown contextmenu',
        (evt) => {
          L.DomEvent.stop(evt);

          const layer = evt.propagatedFrom as ReactiveLayer;

          if (evt.type === 'click' && layer.isClickEventFireCancelled) return;

          const target = layer.getTheWorld();
          apply(target, evt);
        },
        this,
      )
      .on('mouseover mouseout', (evt: LeafletEvent) => {
        L.DomEvent.stop(evt);
        const layer = evt.propagatedFrom as ReactiveLayer;
        const target = layer.getTheWorld();

        if (target.renderingMode === 'mixed') {
          mouseoverout(target, evt);
        } else {
          apply(target, evt);
        }
      });

    const apply = (layer: ReactiveLayer, evt: LeafletEvent) => {
      const onFn = const$$.event2behavior[`item@${evt.type}`];
      this.modeMgr.apply(onFn, layer, evt);
      tryInvokingOwn(this.$$parent, onFn);

      this.fire(evt.type as LayerListEventType, {
        layer,
        leafletEvt: evt,
      });
    };

    let is_hovered = false;
    let mouseout_timer = null;

    /**
     * This is designed for Group for group composited with many elements,
     * and some of which may share one area of canvas.
     */
    const mouseoverout = (layer: ReactiveLayer, evt: LeafletEvent) => {
      if (is_hovered && evt.type === 'mouseout') {
        mouseout_timer = setTimeout(() => {
          is_hovered = false;
          mouseout_timer = null;

          apply(layer, evt);
        }, 32);
      } else {
        if (mouseout_timer) {
          clearTimeout(mouseout_timer);
          mouseout_timer = null;
        }

        if (!is_hovered) {
          is_hovered = true;

          apply(layer, evt);
        }
      }
    };

    layers && this.addArr(layers);
  }

  protected override _add(item: M): void {
    this.featureGroup.addLayer(item as unknown as L.Layer);
    util$$.writeProp(item, '$$parent', this);

    super._add(item);
  }

  protected override _remove(item: M): void {
    super._remove(item);

    this.featureGroup.removeLayer(item as unknown as L.Layer);
    util$$.writeProp(item, '$$parent', null);
  }

  protected override _clear(): void {
    this.featureGroup.clearLayers();
    super._clear();
  }

  mount(root: WikMap) {
    this.assign('scene', root);
    root.addLayer(this.featureGroup);
    this.assign('mounted', true);
  }

  unmount() {
    this.scene.removeLayer(this.featureGroup);
    this.assign('scene', null);
    this.assign('mounted', false);
  }

  fit(immediately = false) {
    const b = this.featureGroup.getBounds();
    if (!b.isValid()) return;
    if (immediately) {
      this.scene.fitBounds(b, { animate: true });
    } else {
      setTimeout(() => {
        this.scene.fitBounds(b, { animate: true });
      }, 10);
    }
  }

  dispose(): void {}

  setZ(z: number) {
    throw new Error('Method not implemented.');
  }

  create(...args: any[]): M {
    throw new Error('Method not implemented.');
  }
}
