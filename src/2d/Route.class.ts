import L from 'leaflet';
import { CubicBezierCurve, leafletOptions } from './utils';
import { Polyline } from './basic';

@leafletOptions<L.PolylineOptions>({
  weight: 1,
  interactive: false,
  stroke: true,
})
export class Route extends Polyline {
  private part: L.LatLngExpression[] = null;
  private top: L.LatLngLiteral = null;

  /**
   * move to
   */
  M(latlng: L.LatLngExpression): this;
  M(lat: L.LatLngExpression | number, lng?: number) {
    this.F();

    this.top = typeof lat === 'number' ? { lat, lng } : L.latLng(lat);
    this.part = [this.top];

    return this;
  }
  /**
   * line to
   */
  L(latlng: L.LatLngExpression): this;
  L(lat: L.LatLngExpression | number, lng?: number) {
    this.top = typeof lat === 'number' ? { lat, lng } : L.latLng(lat);
    this.part.push(this.top);

    return this;
  }
  /**
   * horizontal line to
   */
  H(lng: number) {
    this.top = { lat: 0, lng };
    this.part.push(this.top);

    return this;
  }
  /**
   * veertically line to
   */
  V(lat: number) {
    this.top = { lat, lng: 0 };
    this.part.push(this.top);

    return this;
  }
  /**
   * bezizer curve to
   */
  B(to: L.LatLngExpression, c0: L.LatLngExpression, c1: L.LatLngExpression) {
    if (!this.top) return this;

    const top: L.LatLngLiteral = L.latLng(to);

    const b = new CubicBezierCurve(this.top, L.latLng(c0), L.latLng(c1), top);

    this.top = top;

    for (let i = 0; i < 1000; i++) {
      this.part.push(b.at(i / 1000));
    }

    return this;
  }

  F() {
    if (!this.part) return this;

    this.latlngs.push(this.part as any);
    this.part = null;
    this.top = null;

    return this;
  }
}
