import { LinearLine1D } from '../../utils';
import { HrAnimation } from './Animation.class';
import { ReactiveLayerWithAnimate } from './WithAnimate';

const { abs } = Math;

export class RotationAnimation extends HrAnimation<ReactiveLayerWithAnimate> {
  private ddeg: number;
  readonly value: number;
  private linear: LinearLine1D;
  private i = 0;

  constructor(m: ReactiveLayerWithAnimate, deg: number) {
    super(m, deg, { delay: 0 });
  }

  start(t: number) {
    // this.ddeg = (this.value - this.m.angle) / this.duration;

    this.linear = new LinearLine1D(this.m.angle, this.value);
  }

  run(elapse: number, dt: number) {
    const i = this.i;

    // N = 100 ?
    // requestAnimationFrame: min(dt) = 1/60 s.

    if (i > 100) return false;

    const diff = this.linear.diff(i / 100, (i + 1) / 100);
    this.m.rotate(diff);

    // this.m.rotate(this.ddeg * dt);

    this.i += 1;

    return true;
  }

  calcDur() {
    // k = time / dA
    // return abs(this.value - this.m.angle) * 20;
    return Infinity;
  }

  final(): void {
    this.m.setAngle(this.value);
  }
}
