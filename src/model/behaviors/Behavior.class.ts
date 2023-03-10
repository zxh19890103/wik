import { GraphicObject } from '@/interfaces';
import { IBehavior } from '@/interfaces';

export abstract class Behavior implements IBehavior {
  abstract onLoad(): void;
  abstract onUnload(): void;

  onHover(obj: GraphicObject, evt: unknown): void {}
  onUnHover(obj: GraphicObject, evt: unknown): void {}
  onClick(obj: GraphicObject, evt: unknown): void {}
  onDblClick(obj: GraphicObject, evt: unknown): void {}

  onMouseDown(evt: unknown): void {}
  onMouseMove(evt: unknown): void {}
  onMouseUp(evt: unknown): void {}
  onNoopClick(evt: unknown): void {}
  onPress(obj: GraphicObject, evt: unknown): void {}
  onContextMenu(obj: GraphicObject, evt: unknown): void {}
}
