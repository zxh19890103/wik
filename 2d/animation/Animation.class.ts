import { AnimationState } from './AnimationState.enum';
import { AnimationType } from './AnimationType.enum';
import { WithAnimate } from './WithAnimate';

let __id_seed = 2023;

export abstract class HrAnimation<M extends WithAnimate = WithAnimate> {
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
}
