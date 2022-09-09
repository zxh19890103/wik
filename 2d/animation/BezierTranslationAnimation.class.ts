import L from 'leaflet';
import { CubicBezierCurve, rad2vector, vector2rad } from '../../utils';
import { HrAnimation, HrAnimationOptions } from './Animation.class';
import { R2D } from '../basic/constants';
import { ReactiveLayerWithAnimate } from './WithAnimate';

interface BezierTranslationAnimationOptions extends HrAnimationOptions {
  controls: L.LatLngLiteral[];
}

export class BezierTranslationAnimation extends HrAnimation<ReactiveLayerWithAnimate> {
  private path: L.LatLngLiteral[] = [];

  readonly options: BezierTranslationAnimationOptions;
  readonly value: { lat: number; lng: number };
  private bezier: CubicBezierCurve;

  constructor(m: ReactiveLayerWithAnimate, value: L.LatLngLiteral, ...controls: L.LatLngLiteral[]) {
    super(m, value as any, { delay: 0, controls });
  }

  start(t: number) {
    const position = this.m.position;
    const b = new CubicBezierCurve(position, ...this.options.controls, this.value);

    const d = b.measure(0, 1, 1000);
    this.N = Math.ceil(
      (60 * this.globalConstMgr.robotAnimationRate * d) / this.globalConstMgr.kubotMoveSpeed,
    );

    this.path = b.sample(0, 1, 1000);

    const map = (this.m as any)._map;

    L.polyline(this.path).addTo(map);

    this.bezier = b;
  }

  calcDur() {
    return Infinity;
  }

  run(elapse: number, dt: number, t: number) {
    const latlng = this.bezier.at(t / this.N);
    this.m.setPosition(latlng);
    return true;
  }

  final(): void {
    this.m.setPosition(this.value.lat, this.value.lng);
  }
}
