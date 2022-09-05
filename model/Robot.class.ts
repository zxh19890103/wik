import { Base, View } from './basic/Base.class';

export type RobotEffect = 'Translate' | 'Rotate' | 'State';

export class Robot extends Base<RobotEffect> {
  px: number = 0;
  py: number = 0;
  pz: number = 0;
  theta: number = 0;
  error: boolean = false;

  fromJSON(d: any): this {
    return this;
  }

  toJSON() {
    return { ...this };
  }

  translate(x: number, y: number) {
    this.px += x;
    this.py += y;
    this.reqEffectCall('Translate', { x, y });
  }

  translateTo(x: number, y: number) {
    this.px = x;
    this.py = y;
  }

  rotateTo(deg: number) {
    this.theta = deg;
    // this.reqEffectCall('Rotate', deg);
  }

  rotate(deg: number) {
    this.theta += deg;
    this.reqEffectCall('Rotate', deg);
  }
}
