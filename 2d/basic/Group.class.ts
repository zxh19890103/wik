import L from 'leaflet';
import { ReactiveLayer } from '../../mixins/ReactiveLayer';
import { OnSelect, OnInteractName, OnMouseOverOut } from '../../interfaces/Interactive';
import { uniqueLayerId, WithLayerID } from '../../interfaces/WithLayerID';

export class Group<M extends ReactiveLayer = ReactiveLayer>
  extends L.FeatureGroup
  implements OnSelect, OnMouseOverOut, WithLayerID
{
  layerId: string = uniqueLayerId();
  children: M[] = [];

  constructor(layers: M[] = []) {
    super(layers as unknown as L.Layer[], {});
    this.children = layers;

    this.on('click mouseover mouseout', (e) => {
      switch (e.type) {
        case 'click':
          this.onClick(e as L.LeafletMouseEvent);
          break;
        case 'mouseover':
          this.onHover();
          break;
        case 'mouseout':
          this.onUnHover();
          break;
        default:
          break;
      }
    });
  }

  protected broadcastEvent(name: OnInteractName, e: L.LeafletMouseEvent) {
    for (const child of this.children) {
      if (child === e.propagatedFrom) continue;
      if (!child[name]) continue;
      child[name](e as any);
    }
  }

  onSelect(): void {
    this.broadcastEvent('onSelect', null);
  }

  onUnSelect(): void {
    this.broadcastEvent('onUnSelect', null);
  }

  onHover(): void {
    this.broadcastEvent('onHover', null);
  }

  onUnHover(state?: any): void {
    this.broadcastEvent('onUnHover', null);
  }

  onClick(e: L.LeafletMouseEvent) {
    this.broadcastEvent('onClick', e);
  }

  addLayers(...layers: M[]) {
    this.children.push(...layers);

    for (const layer of layers) {
      super.addLayer(layer as unknown as L.Layer);
    }
  }
}
