const { pow } = Math;

export class CubicBezier {
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
   *
   * @param s percent [0 - 100]
   * @param e percent [0 - 100]
   * @param n samples
   */
  sample(s: number, e: number, n = 100) {
    const step = (e - s) / n;
    return Array(n)
      .fill(0)
      .map((_, i) => {
        return this.at((s + i * step) / 100);
      });
  }
}
