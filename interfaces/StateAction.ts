export interface IStateAction {
  readonly tag: number;
  apply(): void;
  revert(): void;
}

export interface IStateActionManager {
  push(sa: IStateAction): this;
  pop(...args: any[]): this;
  delete(tag: number): this;
}
