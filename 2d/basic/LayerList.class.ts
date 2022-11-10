import L from 'leaflet';
import { HrMap } from './Map.class';
import { IDisposable } from '../../interfaces/Disposable';
import { LayerWithID } from '../../interfaces/WithLayerID';
import { InteractiveStateActionManager } from '../../model/state';
import { inject } from '../../model/basic/inject';
import { WithClickCancel } from '../../mixins/ClickCancel';
import { IInjector, WithInjector } from '../../interfaces/Injector';
import { IWarehouse } from '../../model';
import { CoreList } from '../../model/basic/Core.class';
import { IWarehouseObjectList } from '../../model/IWarehouseObjectList';
import { writeReadonlyProp } from '../../model/basic';
import Interface from '../../interfaces/symbols';

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

  @inject(Interface.IStateActionManager)
  readonly interactiveStateActionManager: InteractiveStateActionManager;
  readonly mounted = false;

  protected featureGroup: L.FeatureGroup = null;
  readonly scene: HrMap = null;

  constructor(layers?: M[]) {
    super();
    this.featureGroup = new L.FeatureGroup([], {});

    /**
     * stop the leaflet events and transform to emiter
     */
    this.featureGroup.on(
      'click dblclick mousedown mouseover mouseout contextmenu',
      (evt) => {
        L.DomEvent.stop(evt);

        const layer = evt.propagatedFrom as WithClickCancel;

        if (evt.type === 'click' && layer.isClickEventFireCancelled) return;

        this.fire(evt.type as LayerListEventType, {
          layer,
          leafletEvt: evt,
        });
      },
      this,
    );

    layers && this.addArr(layers);
  }

  protected override _add(item: M): void {
    this.featureGroup.addLayer(item as unknown as L.Layer);
    super._add(item);
  }

  protected override _remove(item: M): void {
    this.featureGroup.removeLayer(item as unknown as L.Layer);
    super._remove(item);
  }

  protected override _clear(): void {
    this.featureGroup.clearLayers();
    super._clear();
  }

  mount(root: HrMap) {
    writeReadonlyProp(this, 'scene', root);
    root.addLayer(this.featureGroup);
    writeReadonlyProp(this, 'mounted', true);
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
