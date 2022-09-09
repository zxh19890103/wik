import { LinearLine1D } from '../../utils';
import { HrAnimation } from './Animation.class';
import { ReactiveLayerWithAnimate } from './WithAnimate';

/**
 * 旋转90度一般3.5s
 */

export class RotationAnimation extends HrAnimation<ReactiveLayerWithAnimate> {
  readonly value: number;
  private linear: LinearLine1D;

  constructor(m: ReactiveLayerWithAnimate, deg: number) {
    super(m, deg, { delay: 0 });
  }

  start(t: number) {
    this.linear = new LinearLine1D(this.m.angle, this.value);
    const d = this.linear.measure(0, 1);
    this.N = Math.ceil(
      (60 * d * this.globalConstMgr.robotAnimationRate) / this.globalConstMgr.kubotRotateSpeed,
    );
  }

  run(elapse: number, dt: number, t: number) {
    const diff = this.linear.diff(t / this.N, (t + 1) / this.N);
    this.m.rotate(diff);
  }

  calcDur() {
    return Infinity;
  }

  final(): void {
    this.m.setAngle(this.value);
  }
}
