import { ReactiveLayer } from '../../mixins/ReactiveLayer';
import { AnimationType } from './AnimationType.enum';
import { HrAnimation } from './Animation.class';
import { AnimationManager } from './AnimationManager.class';

export interface WithAnimate {
  currentAnimation: HrAnimation;
  animationMgr: AnimationManager;
  /**
   * append an animation obj.
   */
  animate(t: AnimationType, ...args: any[]): void;
}

export function appendAnimation<A extends HrAnimation>(this: WithAnimate, animation: A) {
  if (this.currentAnimation) {
    let tail = this.currentAnimation;
    while (tail.next) {
      tail = tail.next;
    }
    tail.next = animation;
  } else {
    this.animationMgr.add(animation);
  }
}

export interface ReactiveLayerWithAnimate extends ReactiveLayer, WithAnimate {}
