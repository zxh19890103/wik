import { GraphicObject } from '../../interfaces/GraghicObject';
import { IBehavior } from '../../interfaces/Mode';

export abstract class Behavior implements IBehavior {
  abstract onLoad(): void;
  abstract onUnload(): void;

  onHover(obj: GraphicObject, on: boolean): void {}
  onClick(obj: GraphicObject): void {}
  onDblClick(obj: GraphicObject): void {}
  onMouseDown(evt: unknown): void {}
  onMouseMove(evt: unknown): void {}
  onMouseUp(evt: unknown): void {}
  onNoopClick(evt: unknown): void {}
  onPress(obj: GraphicObject, evt: unknown): void {}
  onContextMenu(obj: GraphicObject, evt: unknown): void {}
}
