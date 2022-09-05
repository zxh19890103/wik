import { ReactiveLayer } from '../../mixins/ReactiveLayer';
import { injectable } from '../../model/basic/inject';

const { abs, sqrt } = Math;

export namespace hr {
  export enum AnimationType {
    translate = 1,
    rotate = 2,
    variable = 3,
  }

  export enum AnimationState {
    init = 0,
    queued = 10,
    running = 20,
    stop = 25,
    finished = 30,
  }

  export const MS_PER_FRAME = 1000 / 10;

  let __id_seed = 2023;

  export abstract class Animation<M extends WithAnimate = WithAnimate> {
    readonly id = __id_seed++;
    readonly delay: number;

    state: AnimationState = AnimationState.init;
    queuedAt = 0;
    startAt = null;
    duration = 0;

    public lastElapse: number = null;
    public epslon = 0;

    constructor(protected type: AnimationType, public m: M, delay: number) {
      this.delay = delay;
    }

    abstract start(t: number): void;
    abstract run(elapse: number, deltaT: number): void;
    abstract calcDur(): void;
    abstract final(): void;
    abstract remainingDist(): number;
  }

  export interface WithAnimate {
    currentAnimation: Animation;
    animate(t: AnimationType, n0: number, n1?: number): void;
  }

  export interface ReactiveLayerWithAnimate extends ReactiveLayer, WithAnimate {}
}

export enum AnimationManagerState {
  idle = 0,
  running = 10,
  stop = 20,
}

@injectable()
export class AnimationManager {
  animations: hr.Animation[] = [];
  private state: AnimationManagerState = AnimationManagerState.idle;

  add(animtion: hr.Animation) {
    this.animations.push(animtion);
    animtion.state = hr.AnimationState.queued;
    animtion.queuedAt = performance.now();
    if (this.state !== AnimationManagerState.idle) return;
    this.bootstrap();
  }

  loop = () => {
    if (this.state === AnimationManagerState.stop) {
      this.state = AnimationManagerState.idle;
      this.final();
      console.log('stopped for manually');
      return;
    }

    const animations = this.animations;
    const size = animations.length;

    if (animations.length === 0) {
      this.state = AnimationManagerState.idle;
      console.log('stopped for length === 0');
      return;
    }

    const now = performance.now();

    let deleted = 0;

    /**
     * While the script takes long, user interactive will be blocked. What's the solution?
     */
    for (let item: hr.Animation, i = 0; i < size; i += 1) {
      item = animations[i];

      switch (item.state) {
        case hr.AnimationState.finished: {
          console.log('item finished');
          deleted += 1;
          continue;
        }
        case hr.AnimationState.queued: {
          item.calcDur();
          const currItem = item.m.currentAnimation;
          if (currItem) {
            currItem.final();
            currItem.state = hr.AnimationState.finished;
          }
          item.start(now);
          item.state = hr.AnimationState.running;
          item.m.currentAnimation = item;
          item.startAt = now;
          console.log('item start');
          break;
        }
        case hr.AnimationState.stop: {
          console.log('item stop req');
          item.state = hr.AnimationState.finished;
          item.m.currentAnimation = null;
          item.final();
          continue;
        }
      }

      const elapse = now - item.startAt;
      if (elapse < item.delay) {
        console.log('item animation wait');
      } else {
        //  && item.remainingDist() < item.epslon
        if (elapse > item.duration) {
          item.state = hr.AnimationState.finished;
          item.m.currentAnimation = null;
          item.final();
        } else {
          if (item.lastElapse !== null) {
            const dt = elapse - item.lastElapse;
            item.run(elapse, dt);
          }
        }
      }

      item.lastElapse = elapse;
    }

    if (deleted > 10 || deleted === size) {
      this.animations = this.animations.filter((a) => a.state !== hr.AnimationState.finished);
    }

    requestAnimationFrame(this.loop);
  };

  stop() {
    if (this.state === AnimationManagerState.running) {
      this.state = AnimationManagerState.stop;
    }
  }

  pause() {}
  resume() {}

  final() {
    for (const ani of this.animations) {
      ani.final();
    }

    this.animations = [];
  }

  bootstrap() {
    this.state = AnimationManagerState.running;
    this.loop();
  }
}

export class TranslationAnimation extends hr.Animation<hr.ReactiveLayerWithAnimate> {
  private lat = 0;
  private lng = 0;

  private dlat = 0;
  private dlng = 0;

  constructor(m: hr.ReactiveLayerWithAnimate, lat: number, lng: number, delay = 0) {
    super(hr.AnimationType.translate, m, delay);
    this.lat = lat;
    this.lng = lng;
  }

  start(t: number) {
    const position = this.m.position;
    const dur = this.duration;

    this.dlat = (this.lat - position.lat) / dur;
    this.dlng = (this.lng - position.lng) / dur;

    this.epslon = hr.MS_PER_FRAME * sqrt(this.dlat * this.dlat + this.dlng * this.dlng);
  }

  calcDur() {
    const dx = this.lng - this.m.position.lng;
    const dy = this.lat - this.m.position.lat;
    this.duration = sqrt(dx * dx + dy * dy) * 0.4;
  }

  run(elapse: number, dt: number): void {
    this.m.translate(this.dlat * dt, this.dlng * dt);
  }

  remainingDist() {
    const { lat, lng } = this.m.position;
    const dx = this.lng - lng;
    const dy = this.lat - lat;
    return sqrt(dx * dx + dy * dy);
  }

  final(): void {
    this.m.setPosition(this.lat, this.lng);
  }
}

export class RotationAnimation extends hr.Animation<hr.ReactiveLayerWithAnimate> {
  private deg: number;
  private ddeg: number;

  constructor(m: hr.ReactiveLayerWithAnimate, deg: number, delay = 0) {
    super(hr.AnimationType.rotate, m, delay);
    this.deg = deg;
  }

  start(t: number) {
    this.ddeg = (this.deg - this.m.angle) / this.duration;
    this.epslon = hr.MS_PER_FRAME * abs(this.ddeg);
  }

  run(elapse: number, dt: number): void {
    this.m.rotate(this.ddeg * dt);
  }

  calcDur() {
    this.duration = abs(this.deg - this.m.angle) * 20;
  }

  final(): void {
    this.m.setAngle(this.deg);
    console.log('final in angle');
  }

  remainingDist(): number {
    return abs(this.m.angle - this.deg);
  }
}

export class OneDimensionVarAnimation extends hr.Animation<L.Circle & hr.WithAnimate> {
  private vol = 0;
  private vol0 = 0;
  private dvol = 0;

  constructor(m: any, vol: number, delay = 0) {
    super(hr.AnimationType.variable, m, delay);
    this.vol = vol;
    this.vol0 = m.getRadius();
  }

  start(t: number): void {
    this.dvol = (this.vol - this.vol0) / this.duration;
  }

  run(elapse: number, deltaT: number): void {
    this.m.setRadius(deltaT * this.dvol + this.m.getRadius());
  }

  calcDur(): void {
    this.duration = abs(this.m.getRadius() - this.vol);
  }

  final(): void {
    this.m.setRadius(this.vol);
  }

  remainingDist(): number {
    return abs(this.vol - this.m.getRadius());
  }
}
