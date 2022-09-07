import L from 'leaflet';
import { CubicBezier } from '../../utils';
import { HrAnimation, HrAnimationOptions } from './Animation.class';
import { ReactiveLayerWithAnimate } from './WithAnimate';

const { sqrt } = Math;

interface BezierTranslationAnimationOptions extends HrAnimationOptions {
  controls: L.LatLngLiteral[];
}

export class BezierTranslationAnimation extends HrAnimation<ReactiveLayerWithAnimate> {
  private path: L.LatLngLiteral[] = [];

  readonly options: BezierTranslationAnimationOptions;
  readonly value: { lat: number; lng: number };

  constructor(m: ReactiveLayerWithAnimate, value: L.LatLngLiteral, ...controls: L.LatLngLiteral[]) {
    super(m, value as any, { delay: 0, controls });
  }

  start(t: number) {
    const position = this.m.position;
    const b = new CubicBezier(position, ...this.options.controls, this.value);
    this.path = b.sample(0, 100, 1000);
    L.polyline(this.path).addTo((this.m as any)._map);
  }

  calcDur() {
    return Infinity;
  }

  run(elapse: number, dt: number) {
    const latlng = this.path.shift();
    if (!latlng) {
      return false;
    }

    const dx = latlng.lng - this.m.position.lng;
    const dy = latlng.lat - this.m.position.lat;

    /**
     *
     * [0, 1] -> [dx, dy]
     * @see https://www.omnicalculator.com/math/angle-between-two-vectors
     * arccos[(xa * xb + ya * yb) / (√(xa2 + ya2) * √(xb2 + yb2))]
     */

    // angle between [0, 1] and [dx, dy]
    /***
     * @todo Not all cases are valid.
     */
    const rad = Math.acos(dy / sqrt(dx * dx + dy * dy));

    this.m.setPosition(latlng.lat, latlng.lng);
    this.m.setAngle((rad * 180) / Math.PI);

    return true;
  }

  final(): void {
    this.m.setPosition(this.value.lat, this.value.lng);
  }
}
