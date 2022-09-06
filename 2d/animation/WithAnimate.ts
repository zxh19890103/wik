import { ReactiveLayer } from '../../mixins/ReactiveLayer';
import { AnimationType } from './AnimationType.enum';
import { HrAnimation } from './Animation.class';

export interface WithAnimate {
  currentAnimation: HrAnimation;
  animate(t: AnimationType, n0: number, n1?: number): void;
}

export interface ReactiveLayerWithAnimate extends ReactiveLayer, WithAnimate {}
