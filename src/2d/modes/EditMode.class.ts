import { Mode } from '../../model/modes';
import { WikMap } from '../basic';

export class EditMode extends Mode {
  constructor(private map: WikMap) {
    super('interact');
  }

  override onLoad(): void {}

  override onUnload(): void {}
}
