import { effect } from './basic/effect';
import { prop } from './basic/prop';
import { WikModel } from './WikModel.class';

export enum RobotEffect {
  translate = 'Translate',
  rotate = 'Rotate',
  state = 'State',
}

export class Robot extends WikModel {
  px = 0;
  py = 0;
  pz = 0;

  theta = 0;
  error = false;
  path = null;

  @prop('0') zone: string;

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
