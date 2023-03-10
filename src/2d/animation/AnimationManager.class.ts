import { GlobalConstManager, inject, injectable, interfaces } from '@/model';
import { WikAnimation } from './Animation.class';
import { AnimationState } from './AnimationState.enum';
import { IDisposable } from '@/interfaces';
import { IInjector, WithInjector } from '@/interfaces';

export enum AnimationManagerState {
  idle = 0,
  running = 10,
  stop = 20,
}

@injectable()
export class AnimationManager implements IDisposable, WithInjector {
  @inject(interfaces.IGlobalConstManager)
  readonly constantsManager: GlobalConstManager;
  readonly injector: IInjector;

  private animations: WikAnimation[] = [];
  private state: AnimationManagerState = AnimationManagerState.idle;

  private isPageHidden = false;
  private onIsPageHiddenChange: (...args) => void;

  constructor() {
    console.log('AnimationManager is constructed');

    this.onIsPageHiddenChange = () => {
      this.isPageHidden = document.visibilityState === 'hidden';
      if (this.isPageHidden) {
        this.flush();
      }
    };

    document.addEventListener('visibilitychange', this.onIsPageHiddenChange);
  }

  dispose(): void {
    document.removeEventListener('visibilitychange', this.onIsPageHiddenChange);
  }

  add(animtion: WikAnimation) {
    if (this.isPageHidden) {
      animtion.final();
      return;
    }

    this.animations.push(animtion);
    this.injector.writeProp(animtion, 'globalConstMgr', this.constantsManager);
    animtion.state = AnimationState.added;
    animtion.addedAt = performance.now();
    animtion.m.currentAnimation = animtion;
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

    if (size === 0) {
      this.state = AnimationManagerState.idle;
      console.log('stopped for length === 0');
      return;
    }

    const now = performance.now();

    let deleted = 0;

    /**
     * While the loop script takes long, user interactive will be blocked. What's the solution?
     */
    for (let item: WikAnimation, i = 0; i < size; i += 1) {
      item = animations[i];

      switch (item.state) {
        case AnimationState.finished: {
          deleted += 1;
          continue;
        }
        case AnimationState.added: {
          /**
           * maybe duration has been calculated.
           */
          if (item.duration === null) {
            item.duration = item.calcDur();

            if (!__PROD__ && typeof item.duration !== 'number') {
              throw new Error('duration should be a number.');
            }

            /**
             * 5ms has no animated effect. We finalize it directly.
             */
            if (item.duration < 5) {
              this.end1(item);
              break;
            }
          }

          item.start(now);
          item.state = AnimationState.running;
          item.startAt = now;
          break;
        }
        case AnimationState.stop: {
          this.end1(item);
          continue;
        }
      }

      const elapse = now - item.startAt;

      if (elapse < item.delay) {
        console.log('item animation wait');
      } else {
        if (elapse > item.duration) {
          // stopped for timeout.
          this.end1(item);
        } else {
          const t = item.t;
          const r =
            item.N > 0
              ? item.run(elapse, item.lastElapse ? elapse - item.lastElapse : 0, t)
              : false;
          if (r === false || t > item.N) {
            // False means you should stop the animation
            this.end1(item);
          } else {
            item.t += 1;
          }
        }
      }

      item.lastElapse = elapse;
    }

    if (deleted > 10 || deleted === size) {
      this.animations = this.animations.filter((a) => a.state !== AnimationState.finished);
    }

    requestAnimationFrame(this.loop);
  };

  stop() {
    if (this.state === AnimationManagerState.running) {
      this.state = AnimationManagerState.stop;
    }
  }

  end1(item: WikAnimation) {
    item.state = AnimationState.finished;
    item.m.currentAnimation = null;
    item.final();

    if (!item.next) return;

    this.add(item.next);
  }

  final() {
    let iterator: WikAnimation = null;

    for (const ani of this.animations) {
      iterator = ani;

      do {
        iterator.final();
      } while ((iterator = iterator.next));

      ani.m.currentAnimation = null;
    }

    this.animations = [];
  }

  flush() {
    this.final();
    this.state = AnimationManagerState.idle;
  }

  bootstrap() {
    this.state = AnimationManagerState.running;
    this.loop();
  }
}
