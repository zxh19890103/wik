import L from 'leaflet';
import { WikMap } from '../basic/Map.class';
import { IWarehouse, interfaces, Behavior, inject, SelectionManager } from '@/model';
import { PaneManager, WikPane } from '../state';

export class RectangleSelectBehavior extends Behavior {
  @inject(interfaces.ISelectionManager)
  private selectionMgr: SelectionManager;
  @inject(interfaces.IPaneManager)
  private paneMgr: PaneManager;

  private rect: L.Rectangle = null;
  private latlng0: L.LatLng = null;
  private latlng1: L.LatLng = null;

  private pane: WikPane;

  constructor(private warehouse: IWarehouse, private map: WikMap) {
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
    this.pane = this.paneMgr.get('selectPane', 'svg');
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

    this.map.cancelClickEventFire();

    this.selectionMgr.many(results);

    this.rect.remove();
    this.rect = null;
    this.latlng0 = null;
    this.latlng1 = null;
  }
}
