import { Behavior } from '@/model';
import { WikMap } from '../basic/Map.class';

export class DragBehavior extends Behavior {
  private isDraggable = false;

  constructor(private map: WikMap) {
    super();
  }

  override onLoad(): void {
    this.isDraggable = this.map.dragging.enabled();

    if (!this.isDraggable) {
      this.map.dragging.enable();
    }
  }

  override onUnload(): void {
    if (!this.isDraggable) {
      this.map.dragging.disable();
    }
  }
}
