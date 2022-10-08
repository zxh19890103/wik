import { Mode } from '../../model/modes';
import { HrMap } from '../basic';

export class EditMode extends Mode {
  constructor(private map: HrMap) {
    super('interact');
  }

  override onLoad(): void {}

  override onUnload(): void {}
}
