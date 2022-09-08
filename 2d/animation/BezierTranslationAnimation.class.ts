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
  private bezier: CubicBezier;
  private i = 0;

  private tangs: L.Polyline;

  constructor(m: ReactiveLayerWithAnimate, value: L.LatLngLiteral, ...controls: L.LatLngLiteral[]) {
    super(m, value as any, { delay: 0, controls });
  }

  start(t: number) {
    const position = this.m.position;
    const b = new CubicBezier(position, ...this.options.controls, this.value);
    this.path = b.sample(0, 100, 1000);

    const map = (this.m as any)._map;

    L.polyline(this.path).addTo(map);

    this.tangs = L.polyline([], { weight: 1, color: '#098' }).addTo(map);

    this.bezier = b;
  }

  calcDur() {
    return Infinity;
  }

  run(elapse: number, dt: number) {
    const latlng = this.path[this.i++];

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

    /***
     * rad between [0,-1] and [dx, dy]
     * [0, -1] is the angle of bot
     * @todo Not all cases are valid.
     */
    let rad = Math.acos(-dy / sqrt(dx * dx + dy * dy));
    if (dy > 0) rad = 2 * Math.PI - rad;

    const latlngs = this.bezier.tangentAt(this.i / 1000, 8000);
    this.tangs.setLatLngs(latlngs);

    this.m.setPosition(latlng.lat, latlng.lng);
    this.m.setAngle((rad * 180) / Math.PI);

    return true;
  }

  final(): void {
    this.m.setPosition(this.value.lat, this.value.lng);
  }
}
