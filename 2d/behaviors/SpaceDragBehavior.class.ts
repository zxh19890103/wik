import L from 'leaflet';
import { Behavior } from '../../model/behaviors/Behavior.class';
import { HrMap } from '../basic';
import { IWarehouse } from '../../model';
import { PaneObject } from '../state';

export class SpaceDragBehavior extends Behavior {
  private isDraggable = false;
  private isSpaceKeyDown = false;

  private onKeyDownUp = (evt: KeyboardEvent) => {
    this.isSpaceKeyDown = evt.type === 'keydown' && evt.code === 'Space';

    if (this.isSpaceKeyDown) {
      this.map.dragging.enable();
    } else {
      this.map.dragging.disable();
    }
  };

  constructor(private map: HrMap) {
    super();
  }

  override onLoad(): void {
    document.addEventListener('keydown', this.onKeyDownUp);
    document.addEventListener('keyup', this.onKeyDownUp);

    this.isDraggable = this.map.dragging.enabled();

    this.map.dragging.disable();
  }

  override onUnload(): void {
    document.removeEventListener('keydown', this.onKeyDownUp);
    document.removeEventListener('keyup', this.onKeyDownUp);

    if (this.isDraggable) {
      this.map.dragging.enable();
    }
  }
}
