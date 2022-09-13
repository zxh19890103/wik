import { injectable } from './inject';

/**
 * 
可以配置的
默认一般移动 1.8M/S
旋转90度一般3.5s
不过移动1.8M/S是最大速度
一般，这个可以配置
 */

@injectable()
export class GlobalConstManager {
  /**
   * the move speed of kubot, mm/s
   *
   * 1800 mm per second
   */
  kubotMoveSpeed = 1800;
  /**
   * the rotation speed of kubot, deg/s
   *
   * 2.5 s per 90 deg.
   */
  kubotRotateSpeed = 90;
  /**
   * Animation effects play rate. default = 1
   */
  robotAnimationRate = 0.4;

  getVal(k: string, defaultVal = null) {
    if (this[k] === undefined) return defaultVal;
    return this[k];
  }

  setVal(k: string, v: any) {
    this[k] = v;
  }
}
