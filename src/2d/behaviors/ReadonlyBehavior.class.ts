import { Behavior } from '@/model/behaviors/Behavior.class';

export class ReadonlyBehavior extends Behavior {
  override onLoad(): void {}
  override onUnload(): void {}
}
