import L from 'leaflet';
import { inject } from '@/model';
import { ImageLayer } from './basic';

import {
  WithAnimate,
  WikAnimation,
  TranslationAnimation,
  RotationAnimation,
  AnimationManager,
  appendAnimation,
} from './animation';

import { WithClone } from '@/interfaces';
import { ImageManager } from './state';
import Interfaces from '@/model/symbols';

export class Bot extends ImageLayer implements WithAnimate, WithClone {
  @inject(Interfaces.IAnimationManager)
  readonly animationManager: AnimationManager = null;
  @inject(Interfaces.IImageManager)
  readonly imageManager: ImageManager = null;
  readonly anglePhase = 90;

  currentAnimation: WikAnimation = null;

  /**
   * @remove
   */
  animate(type: 'rotate' | 'translate', n0: number, n1 = 0) {
    switch (type) {
      case 'rotate': {
        appendAnimation.call(this, new RotationAnimation(this, n0));
        break;
      }
      case 'translate': {
        appendAnimation.call(this, new TranslationAnimation(this, n0, n1));
        break;
      }
    }

    return this;
  }

  clone() {
    const bot = new Bot(this.image, this.width, this.height);
    bot.angle = this.angle;
    bot.position = L.latLng(this.position.lat + 100, this.position.lng + 100);
    return bot;
  }
}
