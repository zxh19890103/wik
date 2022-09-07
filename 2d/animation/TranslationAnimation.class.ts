import { HrAnimation } from './Animation.class';
import { ReactiveLayerWithAnimate } from './WithAnimate';

const { sqrt } = Math;

export class TranslationAnimation extends HrAnimation<ReactiveLayerWithAnimate> {
  private dlat = 0;
  private dlng = 0;
  readonly value: { lat: number; lng: number };

  constructor(m: ReactiveLayerWithAnimate, lat: number, lng: number) {
    super(m, { lat, lng }, { delay: 0 });
  }

  start(t: number) {
    const position = this.m.position;
    const dur = this.duration;

    this.dlat = (this.value.lat - position.lat) / dur;
    this.dlng = (this.value.lng - position.lng) / dur;
  }

  calcDur() {
    const dx = this.value.lng - this.m.position.lng;
    const dy = this.value.lat - this.m.position.lat;
    return sqrt(dx * dx + dy * dy) * 0.4;
  }

  run(elapse: number, dt: number): void {
    this.m.translate(this.dlat * dt, this.dlng * dt);
  }

  final(): void {
    this.m.setPosition(this.value.lat, this.value.lng);
  }
}
