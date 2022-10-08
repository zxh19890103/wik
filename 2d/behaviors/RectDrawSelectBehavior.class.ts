import L from 'leaflet';
import { Behavior } from '../../model/behaviors/Behavior.class';
import { inject } from '../../model/basic/inject';
import { HrMap } from '../basic';
import * as Interfaces from '../../interfaces/symbols';
import { IWarehouse } from '../../model';
import { PaneManager, PaneObject, SelectionManager } from '../state';

export class RectDrawSelectBehavior extends Behavior {
  @inject(Interfaces.ISelectionManager)
  private selectionMgr: SelectionManager;
  @inject(Interfaces.IPaneManager)
  private paneMgr: PaneManager;

  private rect: L.Rectangle = null;
  private latlng0: L.LatLng = null;
  private latlng1: L.LatLng = null;

  private pane: PaneObject;

  constructor(private warehouse: IWarehouse, private map: HrMap) {
    super();
  }

  private toLatLngBounds(p0: L.LatLng, p1: L.LatLng) {
    const min = {
      lat: Math.min(p0.lat, p1.lat),
      lng: Math.min(p0.lng, p1.lng),
    };

    const max = {
      lat: Math.max(p0.lat, p1.lat),
      lng: Math.max(p0.lng, p1.lng),
    };

    return L.latLngBounds(min, max);
  }

  override onLoad(): void {
    this.pane = this.paneMgr.get('selectPane', 'canvas', 498);
  }

  override onUnload(): void {}

  override onMouseDown(evt: L.LeafletMouseEvent): void {
    if (this.map.dragging.enabled()) return;

    this.selectionMgr.clear();

    this.latlng0 = evt.latlng;
  }

  override onMouseMove(evt: L.LeafletMouseEvent): void {
    // not down
    if (!this.latlng0) return;

    this.latlng1 = evt.latlng;

    if (this.rect) {
      this.rect.setBounds(this.toLatLngBounds(this.latlng0, this.latlng1));
    } else {
      this.rect = new L.Rectangle(this.toLatLngBounds(this.latlng0, this.latlng1), {
        renderer: this.pane.renderer,
      }).addTo(this.map);
    }
  }

  override onMouseUp(evt: L.LeafletMouseEvent): void {
    // not drawed.
    if (!this.rect) {
      this.latlng0 = null;
      return;
    }

    const bounds = this.rect.getBounds();

    const results = [];

    /**
     * @todo performance
     */
    this.warehouse.each((item, type) => {
      const layer = item as any;
      if (!this.selectionMgr.isSelectable(layer)) return;

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
        console.log("we don't know how to give judagement.");
      }
    });

    console.log(`you've selected ${results.length} layers.`);

    this.map.cancelObjClickEvent();

    this.selectionMgr.all(results);

    this.rect.remove();
    this.rect = null;
    this.latlng0 = null;
    this.latlng1 = null;
  }
}
