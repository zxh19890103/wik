import { GlobalConstManager } from '../../model/state';
import { AnimationState } from './AnimationState.enum';
import { WithAnimate } from './WithAnimate';

let __id_seed = 2023;

export type WikAnimationValue = number | Record<string, number> | Array<number>;
export type WikAnimationOptions = {
  delay?: number;
  duration?: number;
  [extra: string]: any;
};

export abstract class WikAnimation<M extends WithAnimate = WithAnimate> {
  readonly id = __id_seed++;
  readonly delay: number;
  readonly options: WikAnimationOptions;
  readonly value: WikAnimationValue;

  state: AnimationState = AnimationState.init;
  addedAt = 0;
  startAt = null;
  duration = null;

  /**
   * Time sequence, tick
   */
  t = 0;
  /**
   * count of tick this animation would take to finish it.
   */
  N = 100;

  /**
   * last elapse (unit: ms)
   */
  lastElapse: number = null;

  /**
   * next animation after this finished.
   */
  next: WikAnimation = null;

  readonly globalConstMgr: GlobalConstManager = null;

  constructor(public m: M, value: WikAnimationValue, options: WikAnimationOptions = {}) {
    this.options = options;
    this.delay = options.delay || 0;
    this.duration = options.duration || null;
    this.value = value;
  }

  /**
   * many things to do...
   * prepare
   */
  abstract start(t: number): void;
  /**
   * Returns boolean or void.
   * 1. if it's boolean: true means it'll continue running, false means it would be stopped.
   * 2. if it's void: just keep running util timeout.
   */
  abstract run(elapse: number, deltaT: number, t: number): boolean | void;

  /**
   * computes the duration animation need to take.
   *
   * returns Infinity if you want control the animation by t & N
   */
  abstract calcDur(): number;
  /**
   * set the property to final value on the object/layer
   */
  abstract final(): void;
}
