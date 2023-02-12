import L from 'leaflet';
import { IWarehouse, EssObjectType } from '@/model';
import { Behavior } from '@/model/behaviors';
import { WikMap } from '../../basic/Map.class';

const scale = 1000;

export class FormulaBehavior extends Behavior {
  constructor(private map: WikMap, private wh: IWarehouse) {
    super();
  }

  override onLoad(): void {}

  override onUnload(): void {}

  onNoopClick(evt: L.LeafletMouseEvent): void {
    this.formula1();
    const { lat, lng } = evt.latlng;
    //x: 17728479.55216679; y: 6845162.938197734
    this.map.openPopup(`x: ${Math.ceil(lng / scale)}; y: ${Math.ceil(lat / scale)}`, evt.latlng);
  }

  /**
   * x - y = 11
   * rx + ry = 11
   */
  private formula1() {
    const line1 = L.polyline([], { weight: 1, color: 'red' }).addTo(this.map);
    const line2 = L.polyline([], { weight: 1, color: 'green' }).addTo(this.map);

    const path1 = [];
    const path2 = [];

    for (let x = 0; x <= 121; x += 1) {
      path1.push([(x - 11) * scale, x * scale]);
      path2.push([Math.pow(11 - Math.sqrt(x), 2) * scale, x * scale]);
    }

    line1.setLatLngs(path1);
    line2.setLatLngs(path2);
  }

  /**
   *  x2 + y2 = 25
   * 2x + y = 10
   */
  private formula0() {
    console.log('clicked');

    const line1 = L.polyline([], { weight: 1, color: 'red' }).addTo(this.map);
    const line2 = L.polyline([], { weight: 1, color: 'green' }).addTo(this.map);

    const path1 = [];
    const path1_2 = [];

    const path2 = [];

    const scale = 1000;

    for (let x = -5; x <= 5; x += 0.1) {
      const y = Math.sqrt(25 - x * x);
      path1.push([y * scale, x * scale]);
      path1_2.push([-y * scale, x * scale]);
      path2.push([(10 - 2 * x) * scale, x * scale]);
    }

    line1.setLatLngs([path1, path1_2]);
    line2.setLatLngs(path2);
  }
}
