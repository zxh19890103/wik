import L from 'leaflet';
import { Behavior } from '../../../model/behaviors/Behavior.class';
import { WikMap } from '../../basic';

export class DrawBehavior extends Behavior {
  private polyline: L.Polyline = null;
  private path: L.LatLng[] = [];

  constructor(private map: WikMap) {
    super();
  }

  override onLoad(): void {
    this.map.dragging.disable();
  }

  override onUnload(): void {
    this.map.dragging.enable();
  }

  override onMouseDown(evt: L.LeafletMouseEvent): void {
    this.polyline = new L.Polyline(this.path).addTo(this.map);
    this.path.push(evt.latlng);
  }

  override onMouseMove(evt: L.LeafletMouseEvent): void {
    if (!this.polyline) return;
    this.path.push(evt.latlng);
    this.polyline.setLatLngs(this.path);
  }

  override onMouseUp(evt: L.LeafletMouseEvent): void {
    this.polyline.remove();
    this.polyline = null;
    this.path = [];
  }
}
