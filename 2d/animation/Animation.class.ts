import { AnimationState } from './AnimationState.enum';
import { WithAnimate } from './WithAnimate';

let __id_seed = 2023;

export type HrAnimationValue = number | Record<string, number> | Array<number>;
export type HrAnimationOptions = {
  delay?: number;
  duration?: number;
  [extra: string]: any;
};

export abstract class HrAnimation<M extends WithAnimate = WithAnimate> {
  readonly id = __id_seed++;
  readonly delay: number;
  readonly options: HrAnimationOptions;
  readonly value: HrAnimationValue;

  state: AnimationState = AnimationState.init;
  addedAt = 0;
  startAt = null;
  duration = null;

  lastElapse: number = null;

  next: HrAnimation = null;

  constructor(public m: M, value: HrAnimationValue, options: HrAnimationOptions = {}) {
    this.options = options;
    this.delay = options.delay || 0;
    this.duration = options.duration || null;
    this.value = value;
  }

  abstract start(t: number): void;
  /**
   * Returns boolean or void.
   * 1. if it's boolean: true means it'll continue running, false means it would be stopped.
   * 2. if it's void: just keep running util timeout.
   */
  abstract run(elapse: number, deltaT: number): boolean | void;
  abstract calcDur(): number;
  abstract final(): void;
}
