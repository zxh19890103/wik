export interface WithInput<D = any> {
  onInitInput?(data: D): void;
  onInput(data: D): void;
}
