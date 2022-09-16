import { Base, View } from './basic/Base.class';
import { effect } from './basic/effect';

export enum RobotEffect {
  translate = 'Translate',
  rotate = 'Rotate',
  state = 'State',
}

export class Robot extends Base {
  px = 0;
  py = 0;
  pz = 0;
  theta = 0;
  error = false;

  fromJSON(d: any): this {
    return this;
  }

  toJSON() {
    return { ...this };
  }

  @effect(RobotEffect.translate)
  setPosition(x: number, y: number) {
    this.px += x;
    this.py += y;
  }

  @effect(RobotEffect.rotate)
  setTheta(deg: number) {
    this.theta += deg;
  }
}
