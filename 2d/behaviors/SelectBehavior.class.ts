import L from 'leaflet';
import { Behavior } from '../../model/behaviors/Behavior.class';
import { inject } from '../../model/basic/inject';
import { HrMap, PaneManager, PaneObject, SelectionManager } from '../basic';
import * as Interfaces from '../../interfaces/symbols';
import { IWarehouse } from '../../model';

export class RectDrawBehavior extends Behavior {
  @inject(Interfaces.ISelectionManager)
  private selectionMgr: SelectionManager;
  @inject(Interfaces.IPaneManager)
  private paneMgr: PaneManager;

  private rect: L.Rectangle = null;
  private latlng0: L.LatLng = null;
  private latlng1: L.LatLng = null;
  private moved = false;

  private pane: PaneObject;

  constructor(private warehouse: IWarehouse, private map: HrMap) {
    super();
  }

  override onLoad(): void {
    this.map.dragging.disable();
    this.pane = this.paneMgr.get('selectPane', 'canvas', 498);
  }

  override onUnload(): void {
    this.map.dragging.enable();
  }

  override onNoopClick(evt: unknown): void {
    this.selectionMgr.clearAll();
  }

  override onMouseDown(evt: L.LeafletMouseEvent): void {
    this.latlng0 = this.latlng1 = evt.latlng;
    this.rect = new L.Rectangle(L.latLngBounds(this.latlng0, this.latlng1), {
      renderer: this.pane.renderer,
    }).addTo(this.map);
  }

  override onMouseMove(evt: L.LeafletMouseEvent): void {
    if (!this.rect) return;
    this.latlng1 = evt.latlng;
    this.moved = true;
    this.rect.setBounds(L.latLngBounds(this.latlng0, this.latlng1));
  }

  override onMouseUp(evt: L.LeafletMouseEvent): void {
    if (!this.moved) {
      this.rect?.remove();
      this.rect = null;
      return;
    }

    this.latlng0 = null;
    this.latlng1 = null;

    const bounds = this.rect.getBounds();

    const results = [];

    this.warehouse.each((item, type) => {
      const layer = item as any;
      if (layer.getBounds) {
        // SVGOverlay, ImageOverlay, Polyline, Rectangle, Polygon
        if (bounds.intersects(layer.getBounds())) {
          results.push(layer);
        }
      } else if (layer.getLatLng) {
        // Marker, Circle, CirlceMarker
        if (bounds.contains(layer.getLatLng())) {
          results.push(layer);
        }
      } else {
        // eslint-disable-next-line quotes
        console.log("we don't know how to judage.");
      }
    });

    console.log(`you've selected ${results.length} layers.`);

    this.selectionMgr.all(results);

    this.map.cancelObjClickEvent();

    this.rect.remove();
    this.rect = null;
    this.moved = false;
  }
}
