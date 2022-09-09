import { LatLngVector2D } from '../interfaces/types';
import { LineBuilder } from './Line';
import { DEFAULT_ZERO_VECTOR } from './vector';

const { pow, asin, sqrt } = Math;

export class CubicBezierCurve implements LineBuilder<L.LatLngLiteral> {
  /**
   *
   * @param p0 start
   * @param p1 control#1
   * @param p2 control#2
   * @param p3 end
   */
  constructor(...p: L.LatLngLiteral[]);
  constructor(
    public p0: L.LatLngLiteral,
    public p1: L.LatLngLiteral,
    public p2: L.LatLngLiteral,
    public p3: L.LatLngLiteral,
  ) {}

  /**
   *
   * @param at range of [0, 1]
   * @returns
   */
  at(t: number): L.LatLngLiteral {
    const { p0, p1, p2, p3 } = this;
    const r = 1 - t;
    const k0 = pow(r, 3);
    const k1 = 3 * pow(r, 2) * t;
    const k2 = 3 * r * pow(t, 2);
    const k3 = pow(t, 3);
    return {
      lat: k0 * p0.lat + k1 * p1.lat + k2 * p2.lat + k3 * p3.lat,
      lng: k0 * p0.lng + k1 * p1.lng + k2 * p2.lng + k3 * p3.lng,
    };
  }

  /**
   * computes the angle change from t0 to t1.
   * @param t0 from [0 - 1]
   * @param t1 to [0 - 1]
   */
  diff(t0: number, t1: number) {
    // const dir0 = this.dir(t0); // from
    // const dir1 = this.dir(t1); // to

    // cross = fromX * toY - fromY * toX;
    // return asin(dir0.lng * dir1.lat - dir0.lat * dir1.lng);

    return null;
  }

  diffOf(t0: number, t1: number) {
    const dir0 = this.dir(t0); // from
    const dir1 = this.dir(t1); // to

    // cross = fromX * toY - fromY * toX;
    return asin(dir0.lng * dir1.lat - dir0.lat * dir1.lng);
  }

  diffTo(t: number, basis: L.LatLngLiteral = DEFAULT_ZERO_VECTOR) {
    const dir = this.dir(t); // to

    return asin(basis.lng * dir.lat - basis.lat * dir.lng);
  }

  /**
   * measure the distance between two points.
   * @param t0 [0-1]
   * @param t1 [0-1]
   * @param n integer
   * @returns
   */
  measure(t0: number, t1: number, n = 100) {
    const points = this.sample(t0, t1, n);
    let s = 0,
      i = 1;
    for (; i < n; i++) {
      const p0 = points[i - 1];
      const p1 = points[i];

      const dx = p1.lng - p0.lng;
      const dy = p1.lat - p0.lat;

      s += sqrt(dx * dx + dy * dy);
    }

    return s;
  }

  /**
   *
   * @param s percent [0 - 1]
   * @param e percent [0 - 1]
   * @param n samples
   */
  sample(s: number, e: number, n = 100) {
    const step = (e - s) / n;

    return Array(n)
      .fill(0)
      .map((_, i) => {
        return this.at(s + i * step);
      });
  }

  /**
   * returns the normal vector respresents the direction forward at distance of t.
   */
  dir(t: number): L.LatLngLiteral {
    const p0 = this.at(t);
    const p1 = this.at(t + 0.01);

    const v0 = p1.lat - p0.lat,
      v1 = p1.lng - p0.lng;

    const d = sqrt(v0 * v0 + v1 * v1);

    return {
      lat: v0 / d,
      lng: v1 / d,
    };
  }

  /**
   * get tangent line at t distance with length specified.
   * @param t [0-1]
   * @param length mm default is 1.
   * @returns
   */
  tangentAt(t: number, length = 1): LatLngVector2D {
    const p = this.at(t);
    const dir = this.dir(t);

    return [
      p,
      {
        lat: p.lat + dir.lat * length,
        lng: p.lng + dir.lng * length,
      },
    ];
  }
}
