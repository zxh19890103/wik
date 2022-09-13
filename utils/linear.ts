import { LineBuilder } from './Line';

const { abs, sqrt } = Math;

export class LinearLine1D implements LineBuilder<number> {
  /**
   * value, which is eqaul to var1 considering period provided, and which is the nearest eqaul-value to var0.
   */
  private _var1 = 0;

  constructor(public var0: number, public var1: number, private period: number = 0) {
    if (period === 0) {
      this._var1 = var1; // no period
    } else {
      let min = Infinity,
        j = -1;
      for (let i = -10; i < 10; i++) {
        const tryVal1 = var1 + i * period;
        const gap = abs(tryVal1 - var0);
        if (gap < min) {
          j = i;
          min = gap;
        }
      }

      this._var1 = var1 + j * period;
      console.log(this._var1);
    }
  }

  /**
   *
   * @param t [0 -1]
   */
  at(t: number) {
    // formula:  b(t) = var0 + t * (var1 - var0)
    return this.var0 + (this._var1 - this.var0) * t;
  }

  dir(): number {
    return 0;
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

export class LinearLine2D implements LineBuilder<L.LatLngLiteral> {
  constructor(public p0: L.LatLngLiteral, public p1: L.LatLngLiteral) {}

  at(t: number): L.LatLngLiteral {
    // formula: b(t) = p0 + t * (p1 - p0)
    const dx = this.p1.lng - this.p0.lng;
    const dy = this.p1.lat - this.p0.lat;

    return {
      lat: this.p0.lat + dy * t,
      lng: this.p0.lng + dx * t,
    };
  }

  measure(t0: number, t1: number) {
    const p0 = this.at(t0);
    const p1 = this.at(t1);

    const dx = p1.lng - p0.lng;
    const dy = p1.lat - p0.lat;

    return sqrt(dx * dx + dy * dy);
  }

  sample(t0: number, t1: number, n = 100): L.LatLngLiteral[] {
    const step = (t1 - t0) / n;

    return Array(n)
      .fill(0)
      .map((_, i) => {
        return this.at(t0 + step * i);
      });
  }

  dir(): L.LatLngLiteral {
    return {
      lat: this.p1.lat - this.p0.lat,
      lng: this.p1.lng - this.p0.lng,
    };
  }

  diff(t0: number, t1: number): L.LatLngLiteral {
    const p0 = this.at(t0);
    const p1 = this.at(t1);

    return {
      lat: p1.lat - p0.lat,
      lng: p1.lng - p0.lng,
    };
  }
}
