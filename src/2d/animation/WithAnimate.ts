import { ReactiveLayer } from '../../mixins/ReactiveLayer';
import { WikAnimation } from './Animation.class';
import { AnimationManager } from './AnimationManager.class';

export interface WithAnimate {
  currentAnimation: WikAnimation;
  animationManager: AnimationManager;

  /**
   * This method spec is not required.
   */
  animate(type: string, ...args: any[]): this;
}

export function appendAnimation<A extends WikAnimation>(this: WithAnimate, a: A) {
  if (this.currentAnimation) {
    let tail = this.currentAnimation;
    while (tail.next) tail = tail.next;
    tail.next = a;
  } else {
    this.animationManager.add(a);
  }
}

export interface ReactiveLayerWithAnimate extends ReactiveLayer, WithAnimate {}
