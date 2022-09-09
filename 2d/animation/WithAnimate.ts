import { ReactiveLayer } from '../../mixins/ReactiveLayer';
import { HrAnimation } from './Animation.class';
import { AnimationManager } from './AnimationManager.class';

export interface WithAnimate {
  currentAnimation: HrAnimation;
  animationMgr: AnimationManager;

  animate(type: string, ...args: any[]): this;
}

export function appendAnimation<A extends HrAnimation>(this: WithAnimate, a: A) {
  if (this.currentAnimation) {
    let tail = this.currentAnimation;
    while (tail.next) tail = tail.next;
    tail.next = a;
    console.log('append');
  } else {
    this.animationMgr.add(a);
  }
}

export interface ReactiveLayerWithAnimate extends ReactiveLayer, WithAnimate {}
