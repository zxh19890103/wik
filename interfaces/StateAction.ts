export interface IStateAction {
  readonly tag: number;
  apply(): void;
  revert(): void;
}

export interface IStateActionManager {
  push(...args: any[]): this;
  pop(...args: any[]): this;
  delete(tag: number): this;
}
