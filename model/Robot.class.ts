import { Base, View } from './basic/Base.class';
import { effect } from './basic/effect';

export type RobotEffect = 'Translate' | 'Rotate' | 'State';

export class Robot extends Base<RobotEffect> {
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

  @effect<RobotEffect>('Translate')
  setPosition(x: number, y: number) {
    this.px += x;
    this.py += y;
  }

  @effect<RobotEffect>('Rotate')
  setTheta(deg: number) {
    this.theta += deg;
  }
}
