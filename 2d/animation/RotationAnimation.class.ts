import { HrAnimation } from './Animation.class';
import { AnimationType } from './AnimationType.enum';
import { MS_PER_FRAME } from './constants';
import { ReactiveLayerWithAnimate } from './WithAnimate';

const { abs } = Math;

export class RotationAnimation extends HrAnimation<ReactiveLayerWithAnimate> {
  private deg: number;
  private ddeg: number;

  constructor(m: ReactiveLayerWithAnimate, deg: number, delay = 0) {
    super(AnimationType.rotate, m, delay);
    this.deg = deg;
  }

  start(t: number) {
    this.ddeg = (this.deg - this.m.angle) / this.duration;
    this.epslon = MS_PER_FRAME * abs(this.ddeg);
  }

  run(elapse: number, dt: number): void {
    this.m.rotate(this.ddeg * dt);
  }

  calcDur() {
    this.duration = abs(this.deg - this.m.angle) * 20;
  }

  final(): void {
    this.m.setAngle(this.deg);
  }
}
