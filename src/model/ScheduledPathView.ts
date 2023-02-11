import { View } from './basic/Base.class';
import { Robot, RobotEffect } from './Robot.class';

export interface ScheduledPathView extends View<Robot, RobotEffect> {
  whenTranslate();
}
