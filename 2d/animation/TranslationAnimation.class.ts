import { LinearLine2D, R2D } from '../../utils';
import { HrAnimation } from './Animation.class';
import { ReactiveLayerWithAnimate } from './WithAnimate';

/**
 * 
可以配置的
默认一般移动 1.8M/S
旋转90度一般3.5s
不过移动1.8M/S是最大速度
一般，这个可以配置
 */

export class TranslationAnimation extends HrAnimation<ReactiveLayerWithAnimate> {
  readonly value: { lat: number; lng: number };
  private linear: LinearLine2D;

  constructor(m: ReactiveLayerWithAnimate, lat: number, lng: number) {
    super(m, { lat, lng }, { delay: 0 });
  }

  start(t: number) {
    this.linear = new LinearLine2D(this.m.position, this.value);
    const d = this.linear.measure(0, 1);

    this.N = Math.ceil(
      (60 * this.globalConstMgr.robotAnimationRate * d) / this.globalConstMgr.kubotMoveSpeed,
    );
  }

  calcDur() {
    return Infinity;
  }

  run(elapse: number, dt: number, t: number) {
    const diff = this.linear.diff(t / this.N, (t + 1) / this.N);
    this.m.translate(diff.lat, diff.lng);
  }

  final(): void {
    this.m.setPosition(this.value.lat, this.value.lng);
  }
}
