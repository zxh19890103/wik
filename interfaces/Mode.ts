import { GraphicObject } from './GraghicObject';

export interface IBehavior {
  onLoad(): void;
  onUnload(): void;

  onHover(obj: GraphicObject, evt: unknown): void;
  onUnHover(obj: GraphicObject, evt: unknown): void;
  onClick(obj: GraphicObject, evt: unknown): void;
  onDblClick(obj: GraphicObject, evt: unknown): void;
  onPress(obj: GraphicObject, evt: unknown): void;
  onContextMenu(obj: GraphicObject, evt: unknown): void;

  onMouseDown(evt: unknown): void;
  onMouseMove(evt: unknown): void;
  onMouseUp(evt: unknown): void;
  onNoopClick(evt: unknown): void;
}

export type BehaviorCallback =
  | 'onMouseDown'
  | 'onMouseMove'
  | 'onMouseUp'
  | 'onNoopClick'
  | 'onHover'
  | 'onDblClick'
  | 'onClick'
  | 'onPress'
  | 'onContextMenu';

export interface IMode {
  name: string;
  behaviors: IBehavior[];
  modeMgr: IModeManager;
  load(): void;
  unload(): void;
  onLoad(): void;
  onUnload(): void;
}

export interface IModeManager {
  modes: Map<string, IMode>;

  add(...modes: IMode[]): void;
  remove(...modes: IMode[]): void;

  set mode(val: IMode | string);
  get mode(): IMode;

  apply(callback: BehaviorCallback, ...args: any[]): void;
  create(name: string, ...behaviors: IBehavior[]): void;
}
