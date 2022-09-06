import { AnimationState } from './AnimationState.enum';
import { AnimationType } from './AnimationType.enum';
import { WithAnimate } from './WithAnimate';

let __id_seed = 2023;

export type HrAnimationValue = number | Record<string, number> | Array<number>;
export type HrAnimationOptions = {
  delay: number;
};

export abstract class HrAnimation<
  M extends WithAnimate = WithAnimate,
  V extends HrAnimationValue = number,
> {
  readonly id = __id_seed++;
  readonly delay: number;
  readonly options: HrAnimationOptions;
  readonly value: V;

  state: AnimationState = AnimationState.init;
  queuedAt = 0;
  startAt = null;
  duration = 0;

  public lastElapse: number = null;
  public epslon = 0;

  constructor(protected type: AnimationType, public m: M, value: V, options: HrAnimationOptions) {
    this.options = options;
    this.delay = options.delay || 0;
    this.value = value;
  }

  abstract start(t: number): void;
  abstract run(elapse: number, deltaT: number): void;
  abstract calcDur(): void;
  abstract final(): void;
}
