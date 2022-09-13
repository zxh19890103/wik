import L from 'leaflet';
import { OnContextMenu, OnSelect } from '../interfaces/Interactive';
import { WithInput } from '../interfaces/WithInput';
import { WithLayerState } from '../interfaces/WithLayerState';
import { inject } from '../model/basic/inject';

import { ImageLayer, ImageManager } from './basic';

import {
  WithAnimate,
  HrAnimation,
  TranslationAnimation,
  RotationAnimation,
  AnimationManager,
  appendAnimation,
} from './animation';

import { LeafletMouseEvent } from 'leaflet';
import { ContextMenuItem } from '../interfaces/types';
import { WithClone } from '../interfaces/WithClone';
import * as Interface from '../interfaces/symbols';

type ContextMenuKey = 'rotate' | 'copy';

export class Bot
  extends ImageLayer
  implements WithAnimate, WithInput<BotInput>, OnSelect, OnContextMenu<ContextMenuKey>, WithClone
{
  @inject(Interface.IAnimationManager)
  readonly animationMgr: AnimationManager = null;
  @inject(Interface.IImageManager)
  readonly imageManager: ImageManager = null;

  protected readonly anglePhase: number = 90;

  currentAnimation: HrAnimation = null;

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

  onInput(data: BotInput): void {
    this.setLayerState({ error: data.error });
  }

  onLayerStateUpdate(previousState: unknown): void {}

  onSelect() {
    this.showBounds();
  }

  onUnSelect(state?: any): void {
    this.showBounds(false);
  }

  onInitInput?(data: BotInput): void {
    throw new Error('Method not implemented.');
  }

  clone() {
    const bot = new Bot(this.image, this.width, this.height);
    bot.angle = this.angle;
    bot.position = L.latLng(this.position.lat + 100, this.position.lng + 100);
    return bot;
  }

  onContextMenuClick(key: ContextMenuKey): void | Promise<any> {
    switch (key) {
      case 'rotate': {
        this.rotate(90);
        break;
      }
      case 'copy': {
        const copy = this.clone();
        this.$$list.add(copy);
        break;
      }
    }
  }

  onContextMenu(evt?: LeafletMouseEvent): ContextMenuItem[] {
    return [
      {
        value: 'rotate',
        text: 'Rotate',
      },
      {
        value: 'copy',
        text: 'Copy',
      },
    ];
  }
}

interface BotInput {
  position: L.LatLngTuple;
  theta: number;
  error: boolean;
}

interface BotState {
  error: boolean;
}

export interface Bot extends WithLayerState<BotState> {}
