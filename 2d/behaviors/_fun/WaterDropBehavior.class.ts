import L from 'leaflet';
import { Behavior } from '../../../model/behaviors/Behavior.class';
import { WikMap } from '../../basic';

export class WaterDropBehavior extends Behavior {
  private cirlce: L.Circle = null;
  private trace: L.Polyline = null;
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
    let r = 1000;

    this.cirlce = new L.Circle(evt.latlng, { radius: r, opacity: 0.6 }).addTo(this.map);
    this.trace = new L.Polyline([], { color: '#f80' }).addTo(this.map);
    this.path.push(evt.latlng);

    const run = () => {
      if (r < 100 || !this.cirlce) return;
      requestAnimationFrame(run);
      r -= 16;
      this.cirlce.setRadius(r);
      this.trace.setStyle({ opacity: r / 800 });
    };

    run();
  }

  override onMouseMove(evt: L.LeafletMouseEvent): void {
    if (!this.cirlce) return;
    this.path.push(evt.latlng);
    this.cirlce.setLatLng(evt.latlng);
    this.trace.setLatLngs(this.path);
  }

  override onMouseUp(evt: L.LeafletMouseEvent): void {
    // this.cirlce.remove();
    this.cirlce = null;
    // this.trace.remove();
    this.trace = null;
    this.path = [];
  }
}
