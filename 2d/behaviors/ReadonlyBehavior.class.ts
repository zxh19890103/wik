import { Interactive } from '../../interfaces/Interactive';
import { Behavior } from '../../model/behaviors/Behavior.class';

export class ReadonlyBehavior extends Behavior {
  override onLoad(): void {
    console.log('load ReadonlyBehavior');
  }

  override onUnload(): void {}

  override onMouseDown(evt: unknown): void {
    console.log('map down');
  }

  override onMouseMove(evt: unknown): void {
    console.log('map move');
  }

  override onMouseUp(evt: unknown): void {
    console.log('map up');
  }

  override onHover(layer: Interactive, on: boolean): void {}

  override onClick(layer: Interactive): void {
    alert('you clicked the a layer.');
  }
}
