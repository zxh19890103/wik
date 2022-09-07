import { AnimationState } from './AnimationState.enum';
import { AnimationType } from './AnimationType.enum';
import { WithAnimate } from './WithAnimate';

let __id_seed = 2023;

export type HrAnimationValue = number | Record<string, number> | Array<number>;
export type HrAnimationOptions = {
  delay?: number;
  duration?: number;
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
  addedAt = 0;
  startAt = null;
  duration = null;

  next: HrAnimation = null;

  lastElapse: number = null;

  constructor(
    protected type: AnimationType,
    public m: M,
    value: V,
    options: HrAnimationOptions = {},
  ) {
    this.options = options;
    this.delay = options.delay || 0;
    this.duration = options.duration || null;
    this.value = value;
  }

  abstract start(t: number): void;
  abstract run(elapse: number, deltaT: number): void;
  abstract calcDur(): void;
  abstract final(): void;
}
