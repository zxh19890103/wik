import { View } from './basic/Base.class';
import { Robot, RobotEffect } from './Robot.class';

export interface RobotView extends View<Robot, RobotEffect> {
  whenTranslate(dxy: { x: number; y: number });
  whenRotate(dd: number);
}
