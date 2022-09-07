import { injectable } from '../../model/basic/inject';
import { HrAnimation } from './Animation.class';
import { AnimationState } from './AnimationState.enum';

export enum AnimationManagerState {
  idle = 0,
  running = 10,
  stop = 20,
}

@injectable()
export class AnimationManager {
  animations: HrAnimation[] = [];
  private state: AnimationManagerState = AnimationManagerState.idle;

  add(animtion: HrAnimation) {
    this.animations.push(animtion);
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

    if (animations.length === 0) {
      this.state = AnimationManagerState.idle;
      console.log('stopped for length === 0');
      return;
    }

    const now = performance.now();

    let deleted = 0;

    /**
     * While the script takes long, user interactive will be blocked. What's the solution?
     */
    for (let item: HrAnimation, i = 0; i < size; i += 1) {
      item = animations[i];

      switch (item.state) {
        case AnimationState.finished: {
          console.log('item finished');
          deleted += 1;
          continue;
        }
        case AnimationState.added: {
          /**
           * it should give user an option to select queque OR interupt the current?
           */

          /**
           * maybe duration has been calculated.
           */
          if (item.duration === null) {
            item.calcDur();
          }

          item.start(now);
          item.state = AnimationState.running;
          item.startAt = now;
          console.log('item start');
          break;
        }
        case AnimationState.stop: {
          console.log('item stop req');
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
          if (item.lastElapse !== null) {
            const dt = elapse - item.lastElapse;
            item.run(elapse, dt);
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

  pause() {}
  resume() {}

  end1(item: HrAnimation) {
    item.state = AnimationState.finished;
    item.m.currentAnimation = null;
    item.final();

    if (!item.next) return;

    this.add(item.next);
  }

  final() {
    for (const ani of this.animations) {
      ani.final();
    }

    this.animations = [];
  }

  bootstrap() {
    this.state = AnimationManagerState.running;
    this.loop();
  }
}
