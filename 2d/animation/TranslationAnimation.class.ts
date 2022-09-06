import { HrAnimation } from './Animation.class';
import { AnimationType } from './AnimationType.enum';
import { MS_PER_FRAME } from './constants';
import { ReactiveLayerWithAnimate } from './WithAnimate';

const { sqrt } = Math;

export class TranslationAnimation extends HrAnimation<ReactiveLayerWithAnimate> {
  private lat = 0;
  private lng = 0;

  private dlat = 0;
  private dlng = 0;

  constructor(m: ReactiveLayerWithAnimate, lat: number, lng: number, delay = 0) {
    super(AnimationType.translate, m, delay);
    this.lat = lat;
    this.lng = lng;
  }

  start(t: number) {
    const position = this.m.position;
    const dur = this.duration;

    this.dlat = (this.lat - position.lat) / dur;
    this.dlng = (this.lng - position.lng) / dur;

    this.epslon = MS_PER_FRAME * sqrt(this.dlat * this.dlat + this.dlng * this.dlng);
  }

  calcDur() {
    const dx = this.lng - this.m.position.lng;
    const dy = this.lat - this.m.position.lat;
    this.duration = sqrt(dx * dx + dy * dy) * 0.4;
  }

  run(elapse: number, dt: number): void {
    this.m.translate(this.dlat * dt, this.dlng * dt);
  }

  final(): void {
    this.m.setPosition(this.lat, this.lng);
  }
}
