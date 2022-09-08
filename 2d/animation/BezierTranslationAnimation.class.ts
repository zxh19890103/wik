import L from 'leaflet';
import { CubicBezierCurve, rad2vector, vector2rad } from '../../utils';
import { HrAnimation, HrAnimationOptions } from './Animation.class';
import { D2R, R2D } from '../basic/constants';
import { ReactiveLayerWithAnimate } from './WithAnimate';

const N = 1000;

interface BezierTranslationAnimationOptions extends HrAnimationOptions {
  controls: L.LatLngLiteral[];
}

export class BezierTranslationAnimation extends HrAnimation<ReactiveLayerWithAnimate> {
  private path: L.LatLngLiteral[] = [];

  readonly options: BezierTranslationAnimationOptions;
  readonly value: { lat: number; lng: number };
  private bezier: CubicBezierCurve;
  private i = 0;

  private tangs: L.Polyline;

  constructor(m: ReactiveLayerWithAnimate, value: L.LatLngLiteral, ...controls: L.LatLngLiteral[]) {
    super(m, value as any, { delay: 0, controls });
  }

  start(t: number) {
    const position = this.m.position;
    const b = new CubicBezierCurve(position, ...this.options.controls, this.value);
    this.path = b.sample(0, 1, N);

    const map = (this.m as any)._map;

    L.polyline(this.path).addTo(map);

    this.tangs = L.polyline([], { weight: 1, color: '#098' }).addTo(map);

    this.bezier = b;
  }

  calcDur() {
    return Infinity;
  }

  run(elapse: number, dt: number) {
    const i = this.i;

    const latlng = this.path[i];

    if (!latlng) {
      return false;
    }

    const dir = this.bezier.dirAt(i / N);
    // console.log(vector2rad(dir) * R2D);
    this.m.setAngle(vector2rad(dir) * R2D);

    // if (i === 0) {
    //   const angle0 = rad2vector(this.m.angle * D2R); // angle at this moment.
    //   const rad = this.bezier.diffTo(i / N, angle0);
    //   this.m.rotate(rad * R2D);
    // } else {
    //   const rad = this.bezier.diff(i / N, (i + 1) / N);
    //   this.m.rotate(rad * R2D);
    // }

    const latlngs = this.bezier.tangentAt(i / N, 8000);
    this.tangs.setLatLngs(latlngs);

    this.m.setPosition(latlng.lat, latlng.lng);

    this.i += 1;

    return true;
  }

  final(): void {
    this.m.setPosition(this.value.lat, this.value.lng);
  }
}
