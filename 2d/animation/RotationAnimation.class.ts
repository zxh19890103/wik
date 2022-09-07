import { HrAnimation } from './Animation.class';
import { ReactiveLayerWithAnimate } from './WithAnimate';

const { abs } = Math;

export class RotationAnimation extends HrAnimation<ReactiveLayerWithAnimate> {
  private ddeg: number;
  readonly value: number;

  constructor(m: ReactiveLayerWithAnimate, deg: number) {
    super(m, deg, { delay: 0 });
  }

  start(t: number) {
    this.ddeg = (this.value - this.m.angle) / this.duration;
  }

  run(elapse: number, dt: number): void {
    this.m.rotate(this.ddeg * dt);
  }

  calcDur() {
    // k = time / dA
    return abs(this.value - this.m.angle) * 20;
  }

  final(): void {
    this.m.setAngle(this.value);
  }
}
