const { abs } = Math;

export class LinearLine1D {
  constructor(public var0: number, public var1: number) {}

  /**
   *
   * @param t [0 -1]
   */
  at(t: number) {
    // b = var0 + (t) * (var1 - var0)
    return this.var0 + (this.var1 - this.var0) * t;
  }

  diff(t0: number, t1: number) {
    return this.at(t1) - this.at(t0);
  }

  measure(t0: number, t1: number) {
    const val0 = this.at(t0);
    const val1 = this.at(t1);

    return abs(val1 - val0);
  }

  sample(t0: number, t1: number, n = 100) {
    const s = (t1 - t0) / n;

    return Array(n)
      .fill(0)
      .map((_, i) => {
        return this.at(t0 + s * i);
      });
  }
}

export class LinearLine2D {
  constructor(public p0: L.LatLngLiteral, public p1: L.LatLngLiteral) {}

  at(t: number) {}
  measure(t0: number, t1: number) {}
  sample(t0: number, t1: number, n = 100) {}
  dir() {}
}
