import { Mode } from '@/model';
import { WikMap } from '../basic/Map.class';

export class EditMode extends Mode {
  constructor(private map: WikMap) {
    super('interact');
  }

  override onLoad(): void {}

  override onUnload(): void {}
}
